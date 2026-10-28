/** Protocol v1 used older names. Keep that transport detail out of the public
 * script/skill vocabulary while remaining usable with already released Apps. */
export function scriptMethod(method: string) { return method.startsWith('projects.') ? 'scripts.' + method.slice(9) : method; }
export function wireMethod(method: string) { return method.startsWith('scripts.') ? 'projects.' + method.slice(8) : method; }
export function scriptCapabilities(values: string[]) { return [...new Set(values.map(scriptMethod))]; }
export function scriptError(value: any) {
  if (!value || typeof value !== 'object') return value;
  const codes: Record<string,string> = {invalid_project:'invalid_script',project_mismatch:'script_mismatch',project_exists:'script_exists',project_not_found:'script_not_found',project_conflict:'script_conflict'};
  return codes[value.code] ? {...value,code:codes[value.code],message:typeof value.message==='string'?value.message.replace(/\bprojects\b/gi,'scripts').replace(/\bproject\b/gi,'script'):value.message} : value;
}
/** Only protocol-owned result headers are renamed; never rewrite Script.exit
 * values, user logs, diagnostics, filenames or other script-owned data. */
export function scriptResult(value: any): any {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const {project,projects,currentProject,...result}=value;
  if(result.script===undefined && project!==undefined)result.script=project;
  if(result.scripts===undefined && projects!==undefined)result.scripts=projects;
  if(result.currentScript===undefined && currentProject!==undefined)result.currentScript=currentProject;
  if(result.completionReason==='project_attached')result.completionReason='script_attached';
  if(Array.isArray(result.capabilities))result.capabilities=scriptCapabilities(result.capabilities);
  return result;
}
