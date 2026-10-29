/**
 * LOCAL DATABASE CLIENT
 * ---------------------
 * This project now runs entirely on a local MySQL database (`babahakeem`).
 * To avoid rewriting every component, this module keeps the same surface
 * the app already uses (query builder, rpc, auth, storage) and forwards
 * each call to local Next.js API routes backed by MySQL.
 *
 * Admin sessions live in an HTTP-only cookie set by /api/local/auth.
 */

const post=async(url,body,extra={})=>{
  const response=await fetch(url,{method:'POST',
    headers:{'Content-Type':'application/json',...(extra.headers||{})},
    body:JSON.stringify(body),credentials:'same-origin'});
  let payload=null;
  try{payload=await response.json();}catch{payload=null;}
  const error=response.ok||!payload?.error?null:payload.error;
  return {data:payload&&!payload.error?payload.data??payload:payload?payload.data??null:null,error};
};

class Builder{
  constructor(kind,payload){
    this.kind=kind;this.payload=payload;this.promise=null;
  }
  select(columns){if(this.kind==='query')this.payload.select=columns;return this;}
  eq(column,value){this.payload.filters=[...(this.payload.filters||[]),{column,value}];return this;}
  order(column,{ascending=true}={}){this.payload.order={column,ascending};return this;}
  limit(count){this.payload.limit=count;return this;}
  range(from,to){this.payload.range={from,to};return this;}
  single(){this.payload.single=true;return this;}
  update(values){this.kind='write';this.payload.action='update';this.payload.values=values;return this;}
  insert(values){this.kind='write';this.payload.action='insert';this.payload.values=values;return this;}
  delete(){this.kind='write';this.payload.action='delete';return this;}
  then(onFulfilled,onRejected){return this.execute().then(onFulfilled,onRejected);}
  catch(onRejected){return this.execute().catch(onRejected);}
  finally(callback){return this.execute().finally(callback);}
  async execute(){
    if(this.promise)return this.promise;
    const url=this.kind==='write'?'/api/local/write':'/api/local/query';
    const result=await post(url,this.payload);
    if(this.payload.single){
      return {data:Array.isArray(result?.data)?result.data[0]||null:result?.data??null,error:result?.error||null};
    }
    return result;
  }
}

const authStateListeners=new Set();const emitAuthEvent=(event,session)=>{
  for(const listener of authStateListeners){
    try{listener(event,session);}catch{}
  }
};

const auth={
  async getSession(){
    const response=await fetch('/api/local/auth',{credentials:'same-origin'});
    const payload=await response.json().catch(()=>({}));
    return {data:{session:payload.session||null},error:null};
  },
  async getUser(){
    const response=await fetch('/api/local/auth',{credentials:'same-origin'});
    const payload=await response.json().catch(()=>({}));
    return {data:{user:payload.user||null},error:null};
  },
  async signInWithPassword({email,password}){
    const result=await post('/api/local/auth',{action:'login',email,password});
    if(result.error)return {data:{user:null,session:null},error:result.error};
    const user=result.data?.user||null;
    const session=user?{access_token:'local-session',user}:null;
    emitAuthEvent('SIGNED_IN',session);
    return {data:{user,session},error:null};
  },
  async signUp(){
    return {data:{user:null,session:null},error:{message:'Sign-up is disabled in local database mode. Sign in with the existing admin account.'}};
  },
  async signInWithOtp(){
    return {data:{},error:{message:'Email invitations are not available in local database mode.'}};
  },
  async resetPasswordForEmail(){
    return {data:{},error:{message:'Password recovery emails are not available in local database mode. Reset the password directly in the admins table.'}};
  },
  async updateUser({password}){
    const result=await post('/api/local/auth',{action:'update-password',password});
    if(result.error)return {data:{user:null},error:result.error};
    const {data}=await auth.getUser();
    return {data:{user:data.user},error:null};
  },
  async signOut(){
    await post('/api/local/auth',{action:'logout'});
    emitAuthEvent('SIGNED_OUT',null);
    return {error:null};
  },
  onAuthStateChange(callback){
    authStateListeners.add(callback);
    (async()=>{try{
      const {data}=await auth.getSession();
      if(data.session)emitAuthEvent('INITIAL_SESSION',data.session);
    }catch{}})();
    return {data:{subscription:{unsubscribe:()=>authStateListeners.delete(callback)}}};
  }
};

const storage={
  from(bucket='product-images'){
    return {
      async upload(path,file){
        const form=new FormData();
        form.append('file',file);
        form.append('path',String(path||''));
        const response=await fetch('/api/local/upload',{method:'POST',body:form,credentials:'same-origin'});
        const payload=await response.json().catch(()=>({}));
        if(payload.error)return {data:null,error:payload.error};
        return {data:{path:payload.path},error:null};
      },
      getPublicUrl(path){return {data:{publicUrl:'/uploads/'+String(path||'').replace(/^\/+/,'')}};},
      async remove(paths){
        const result=await fetch('/api/local/upload',{method:'POST',
          headers:{'Content-Type':'application/json','action':'delete'},
          body:JSON.stringify({paths}),credentials:'same-origin'});
        const payload=await result.json().catch(()=>({}));
        return {data:payload.data??[],error:payload.error||null};
      }
    };
  }
};

export const supabase={
  from(table){return new Builder('query',{table,filters:[]});},
  rpc(name,args={}){return {
    then(onFulfilled,onRejected){return post('/api/local/rpc',{name,args}).then(onFulfilled,onRejected);},
    catch(onRejected){return post('/api/local/rpc',{name,args}).catch(onRejected);}
  };},
  auth,
  storage
};

export default supabase;
