#!/usr/bin/env python3
"""Synthetic filesystem boundaries only; no real private inputs are opened."""
import importlib.util
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from unittest import mock

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("private_source_import", ROOT / "tools/private-source-import.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
checks = []


def check(name, operation):
    operation()
    checks.append({"name": name, "status": "PASS"})


def refuses(path):
    try:
        module.outside_git(path)
    except ValueError:
        return
    raise AssertionError("Expected private-source Git boundary refusal")


with tempfile.TemporaryDirectory(prefix="glp-private-source-boundaries-") as name:
    temp = Path(name)
    outside = temp / "outside"
    outside.mkdir()
    check("Outside path, including future nested destination, is admitted", lambda: module.outside_git(outside / "new" / "payload"))
    repo = temp / "repository"
    subprocess.run(["git", "init", "--quiet", str(repo)], check=True)
    check("Regular Git repository destination refuses", lambda: refuses(repo / "new" / "payload"))
    check("Ancestor Git marker refuses deeply nested destination", lambda: refuses(repo / "a" / "b" / "c"))
    with mock.patch.dict(os.environ, {"GIT_DIR": str(temp / "missing-git"), "GIT_WORK_TREE": str(outside), "GIT_CEILING_DIRECTORIES": str(repo)}, clear=False):
        check("Injected Git overrides cannot disguise an in-repository destination", lambda: refuses(repo / "payload"))
        check("Injected Git overrides do not contaminate outside-path classification", lambda: module.outside_git(outside / "payload"))
    bare = temp / "bare.git"
    subprocess.run(["git", "init", "--bare", "--quiet", str(bare)], check=True)
    check("Bare repository destination refuses", lambda: refuses(bare / "new"))
    worktree = temp / "linked-worktree"
    worktree.mkdir()
    (worktree / ".git").write_text("gitdir: /synthetic/dangling/worktree\n")
    check("Worktree .git file refuses even when its target is unavailable", lambda: refuses(worktree / "payload"))
    alias = outside / "repo-alias"
    alias.symlink_to(repo, target_is_directory=True)
    check("Symlink ancestor into a repository refuses before destination creation", lambda: refuses(alias / "new" / "payload"))
    fake = temp / "dangling-marker"
    fake.mkdir()
    (fake / ".git").symlink_to(temp / "not-present")
    check("Dangling .git symlink is not mistaken for absence", lambda: refuses(fake / "payload"))
    input_file = repo / "synthetic.txt"
    input_file.write_text("SYNTHETIC ONLY")
    input_alias = outside / "input-alias.txt"
    input_alias.symlink_to(input_file)
    check("Symlink file input inside a repository refuses", lambda: refuses(input_alias))
    with mock.patch.object(module.subprocess, "run", return_value=subprocess.CompletedProcess([], 128, "", "fatal: detected dubious ownership")):
        check("Unknown Git exit-128 failure refuses instead of claiming outside", lambda: refuses(outside / "payload"))
    with mock.patch.object(module.subprocess, "run", side_effect=FileNotFoundError()):
        check("Missing Git executable fails closed", lambda: refuses(outside / "payload"))

out = ROOT / "evidence/private-source-boundaries"
out.mkdir(parents=True, exist_ok=True)
(out / "results.json").write_text(json.dumps({"status": "PASS", "checks": checks, "scope": "Synthetic directory and environment checks only. No actual payload, password or private-access file inspected."}, indent=2) + "\n")
print(f"Private source import boundaries: {len(checks)} checks passed.")
