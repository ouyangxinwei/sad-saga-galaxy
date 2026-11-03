const OWNER='ouyangxinwei', REPOSITORY='sad-saga-galaxy', TARGET_BRANCH='standalone-migration', WORKFLOW='deploy-pages.yml';
const API=`https://api.github.com/repos/${OWNER}/${REPOSITORY}`, CACHE_MS=30000;
let cached=null, cachedAt=0, pending=null;
async function getJson(url) {
  const res=await fetch(url,{headers:{Accept:'application/vnd.github+json'},cache:'no-store',signal:AbortSignal.timeout(12000)});
  if(!res.ok) throw new Error(`GitHub API request failed: ${res.status}`);
  return res.json();
}
function result(status,extra={}) {
  return {status,branch:TARGET_BRANCH,currentSha:import.meta.env.VITE_GIT_COMMIT_SHA||'',checkedAt:new Date().toISOString(),...extra};
}
export async function checkCurrentDeployment() {
  const sha=import.meta.env.VITE_GIT_COMMIT_SHA||'', branch=import.meta.env.VITE_GIT_BRANCH||'';
  if(!sha||!branch||branch!==TARGET_BRANCH) return result('unknown',{reason:'missing-or-unexpected-build-metadata'});
  const key=TARGET_BRANCH+':'+sha;
  if(cached&&cached.key===key&&Date.now()-cachedAt<CACHE_MS) return {...cached.value,checkedAt:new Date(cachedAt).toISOString(),cached:true};
  if(pending) return pending;
  pending=(async()=>{
    const data=await getJson(`${API}/actions/workflows/${WORKFLOW}/runs?branch=${TARGET_BRANCH}&per_page=100`);
    const runs=(data.workflow_runs||[]).filter(x=>x.head_sha?.toLowerCase()===sha.toLowerCase()&&x.head_branch===TARGET_BRANCH).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    if(!runs.length) return result('not-deployed',{reason:'no-matching-run'});
    const run=runs[0], info={deployedSha:run.head_sha,runId:run.id,runNumber:run.run_number,runUrl:run.html_url,runStatus:run.status,runConclusion:run.conclusion,updatedAt:run.updated_at};
    if(run.status!=='completed') return result('in-progress',info);
    if(run.conclusion!=='success') return result('failed',info);
    const jobs=(await getJson(`${API}/actions/runs/${run.id}/jobs?per_page=100`)).jobs||[];
    const build=jobs.find(x=>x.name?.toLowerCase()==='build'), deploy=jobs.find(x=>x.name?.toLowerCase()==='deploy');
    if(!build||!deploy) return result('unknown',{...info,reason:'required-jobs-not-found'});
    if([build,deploy].some(x=>x.conclusion&&x.conclusion!=='success')) return result('failed',info);
    if([build,deploy].some(x=>x.status!=='completed')) return result('in-progress',info);
    if([build,deploy].every(x=>x.conclusion==='success')) return result('success',info);
    return result('unknown',{...info,reason:'incomplete-job-results'});
  })();
  try { const value=await pending; cached={key,value}; cachedAt=Date.now(); return value; }
  finally { pending=null; }
}
