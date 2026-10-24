/* Verified institution facts. No sound, invented livestream status, or unlicensed photos. */
(()=>{'use strict';
const places={
harmandir:{name:'Sri Harmandir Sahib',gurmukhi:'ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ',region:'AMRITSAR · PUNJAB · INDIA',location:'Amritsar, Punjab, India',zone:'Asia/Kolkata',
 storyTitle:'Open in every direction',
 history:'The SGPC describes Guru Arjan Sahib’s vision of Sri Harmandir Sahib as a central place of Sikh worship. The Sarovar and surrounding settlement developed under Guru Ram Das Ji, and the shrine was built with entrances on all four sides.',
 significance:'In 1604, the Adi Granth was installed here, with Baba Budha Ji appointed the first Granthi. The four entrances continue to express a welcome beyond caste or background.',
 stream:'https://kirtan.sgpc.net/',home:'https://new.sgpc.net/sri-harmandir-sahib/',source:'https://new.sgpc.net/sri-harmandir-sahib/'},
fremont:{name:'Gurdwara Sahib Fremont',gurmukhi:'',region:'FREMONT · CALIFORNIA · USA',location:'Fremont, California, United States',zone:'America/Los_Angeles',
 storyTitle:'A sangat across generations',
 history:'According to Gurdwara Sahib Fremont’s own history, the nonprofit gurdwara was established in 1978. It continues to provide a place for worship and community gathering in the Bay Area.',
 significance:'The gurdwara describes daily programmes, langar, and seva as part of its mission, including assistance during major disasters. This introduction is a source-linked summary, not a live programme listing.',
 stream:'https://www.youtube.com/c/gurdwarasahibfremont',home:'https://fremontgurdwara.org/',source:'https://fremontgurdwara.org/gurdwara-new/'},
sanjose:{name:'Sikh Gurdwara Sahib · San Jose',gurmukhi:'',region:'SAN JOSE · CALIFORNIA · USA',location:'Evergreen, San Jose, California, United States',zone:'America/Los_Angeles',
 storyTitle:'Built by the South Bay sangat',
 history:'The gurdwara’s official history describes a congregation founded in 1984. Early gatherings moved from community spaces to permanent homes as the Sikh community grew.',
 significance:'The present Evergreen site developed in phases, with the first phase completed in 2004 and the second in 2011. Its location in the hills became a gathering place for the expanding South Bay sangat.',
 stream:'https://sanjosegurdwara.org/audioStreaming.html',home:'https://sanjosegurdwara.org/',source:'https://sanjosegurdwara.org/about.html'}
};
const key=new URLSearchParams(location.search).get('place');
if(!Object.prototype.hasOwnProperty.call(places,key)){location.replace('gurdwaras.html');return;}
const p=places[key],$=id=>document.getElementById(id);
document.body.className='arrival detail-'+key;
$('place-region').textContent=p.region;$('place-name').textContent=p.name;$('place-location').textContent=p.location;
$('place-punjabi').textContent=p.gurmukhi;$('place-punjabi').hidden=!p.gurmukhi;
$('place-story-title').textContent=p.storyTitle;$('place-history').textContent=p.history;$('place-significance').textContent=p.significance;
$('place-listen').href=p.stream;$('place-home').href=p.home;$('place-source').href=p.source;
document.title=p.name+' · Gurbani Learning Library';
function clock(){
 const now=new Date();
 const fmt=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:p.zone,hour12:true});
 $('place-time').textContent=fmt.format(now);$('place-timezone').textContent='· Local time';
 const hour=Number(new Intl.DateTimeFormat('en-US',{hour:'numeric',hourCycle:'h23',timeZone:p.zone}).format(now));
 document.body.dataset.time=hour<6?'amrit':hour>=18?'evening':'day';
}
clock();setInterval(clock,60000);
})();
