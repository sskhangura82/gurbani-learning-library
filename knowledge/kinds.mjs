// One content classification shared by rendering and retrieval.
const editorialNodeTypes=new Set(["concept","word","study","lesson","course"]);
export const contentKind=n=>n.type==="passage"?"scripture":editorialNodeTypes.has(n.type)?"editorial":"source-index";
