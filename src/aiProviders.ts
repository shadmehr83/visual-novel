export type Provider = "openai" | "anthropic";
export type AssistantTask = "dialogue" | "system-ui" | "effects";
export const taskHelp: Record<AssistantTask,string> = {
 dialogue:"Rewrite dialogue using existing characters and authored branches.",
 "system-ui":"Suggest phone and item UI settings. Engine code changes use AI Demand Export.",
 effects:"Suggest lighting, rain and camera adjustments for the selected scene."
};
export async function providerCompletion(provider:Provider,env:{AI_API_KEY?:string;AI_MODEL?:string;ANTHROPIC_API_KEY?:string;ANTHROPIC_MODEL?:string},system:string,body:unknown) {
 const anthropic=provider==="anthropic";
 const response=await fetch(anthropic?"https://api.anthropic.com/v1/messages":"https://api.openai.com/v1/chat/completions",{
 method:"POST",signal:AbortSignal.timeout(30000),headers:anthropic?{"x-api-key":env.ANTHROPIC_API_KEY!,"anthropic-version":"2023-06-01","Content-Type":"application/json"}:{Authorization:"Bearer "+env.AI_API_KEY,"Content-Type":"application/json"},
 body:JSON.stringify(anthropic?{model:env.ANTHROPIC_MODEL||"claude-sonnet-4-6",max_tokens:2500,system,messages:[{role:"user",content:JSON.stringify(body)}]}:{model:env.AI_MODEL||"gpt-4.1-mini",max_tokens:2500,response_format:{type:"json_object"},messages:[{role:"system",content:system},{role:"user",content:JSON.stringify(body)}]})});
 if(!response.ok)throw Error("Provider unavailable");const result=await response.json();return anthropic?result.content.filter((x:any)=>x.type==="text").map((x:any)=>x.text).join(""):result.choices[0].message.content;
}
