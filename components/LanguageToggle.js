'use client';

import {useEffect,useRef,useState} from 'react';
import {translateSiteText} from './siteTranslations';

const STORAGE_KEY='baba-hakeem-language';
const SKIP_TAGS=new Set(['SCRIPT','STYLE','NOSCRIPT','CODE','PRE','CANVAS','SVG']);
const ATTRS=['aria-label','title','placeholder','alt'];

export default function LanguageToggle(){
  const [language,setLanguage]=useState('en');
  const languageRef=useRef('en');
  const originalText=useRef(new WeakMap());
  const expectedText=useRef(new WeakMap());
  const originalAttrs=useRef(new WeakMap());
  const applying=useRef(false);

  useEffect(()=>{
    try{
      const saved=localStorage.getItem(STORAGE_KEY);
      if(saved==='ur')setLanguage('ur');
    }catch{}
  },[]);

  useEffect(()=>{
    languageRef.current=language;
    document.documentElement.lang=language==='ur'?'ur':'en';
    document.documentElement.dataset.siteLanguage=language;

    const shouldSkip=node=>{
      const parent=node.nodeType===Node.ELEMENT_NODE?node:node.parentElement;
      if(!parent)return true;
      if(SKIP_TAGS.has(parent.tagName))return true;
      if(parent.closest?.('[data-no-translate]'))return true;
      return false;
    };

    const translateTextNode=node=>{
      if(!node||node.nodeType!==Node.TEXT_NODE||shouldSkip(node))return;
      const current=node.nodeValue||'';
      if(!current.trim())return;
      let original=originalText.current.get(node);
      const expected=expectedText.current.get(node);
      if(original===undefined||(!applying.current&&current!==expected&&current!==original)){
        original=current;
        originalText.current.set(node,original);
      }
      const next=languageRef.current==='ur'?translateSiteText(original):original;
      if(current!==next){
        expectedText.current.set(node,next);
        node.nodeValue=next;
      }else{
        expectedText.current.set(node,next);
      }
    };

    const translateAttrs=element=>{
      if(!element||element.nodeType!==Node.ELEMENT_NODE||shouldSkip(element))return;
      let originals=originalAttrs.current.get(element);
      if(!originals){originals={};originalAttrs.current.set(element,originals);}
      ATTRS.forEach(attr=>{
        if(!element.hasAttribute(attr))return;
        const current=element.getAttribute(attr)||'';
        if(!(attr in originals))originals[attr]=current;
        const next=languageRef.current==='ur'?translateSiteText(originals[attr]):originals[attr];
        if(current!==next)element.setAttribute(attr,next);
      });
    };

    const applyTree=root=>{
      if(!root)return;
      applying.current=true;
      try{
        if(root.nodeType===Node.TEXT_NODE){translateTextNode(root);return;}
        if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_NODE&&root.nodeType!==Node.DOCUMENT_FRAGMENT_NODE)return;
        if(root.nodeType===Node.ELEMENT_NODE)translateAttrs(root);
        const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{
          acceptNode(node){
            return shouldSkip(node)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;
          }
        });
        let node=walker.nextNode();
        while(node){
          if(node.nodeType===Node.TEXT_NODE)translateTextNode(node);
          else translateAttrs(node);
          node=walker.nextNode();
        }
      }finally{applying.current=false;}
    };

    applyTree(document.body);

    /* Language changes can alter text widths/heights. Re-run the website's existing
       resize-driven GSAP measurements so the already-approved bottle destinations
       remain exactly aligned after ENG/Urdu switching. No animation values change. */
    let layoutTimer=0;
    let layoutFrame=0;
    layoutFrame=requestAnimationFrame(()=>requestAnimationFrame(()=>window.dispatchEvent(new Event('resize'))));
    layoutTimer=window.setTimeout(()=>window.dispatchEvent(new Event('resize')),180);

    let frame=0;
    const pending=new Set();
    const flush=()=>{
      frame=0;
      pending.forEach(node=>applyTree(node));
      pending.clear();
    };
    const observer=new MutationObserver(mutations=>{
      if(applying.current)return;
      mutations.forEach(mutation=>{
        if(mutation.type==='characterData'){
          // Ignore our own translated text writes; they do not need another tree walk.
          if(expectedText.current.get(mutation.target)!==(mutation.target.nodeValue||''))pending.add(mutation.target);
          return;
        }
        mutation.addedNodes?.forEach(node=>pending.add(node));
      });
      if(pending.size&&!frame)frame=requestAnimationFrame(flush);
    });
    // English is the source markup. Live translation is only needed for Urdu DOM additions.
    if(language==='ur')observer.observe(document.body,{subtree:true,childList:true,characterData:true});

    window.dispatchEvent(new CustomEvent('baba-language-change',{detail:{language}}));

    return()=>{
      observer.disconnect();
      if(frame)cancelAnimationFrame(frame);
      if(layoutFrame)cancelAnimationFrame(layoutFrame);
      if(layoutTimer)window.clearTimeout(layoutTimer);
    };
  },[language]);

  const chooseLanguage=next=>{
    try{localStorage.setItem(STORAGE_KEY,next);}catch{}
    setLanguage(next);
  };

  return <div className="bh-language-toggle" data-no-translate role="group" aria-label="Website language">
    <button type="button" className={language==='en'?'is-active':''} onClick={()=>chooseLanguage('en')} aria-pressed={language==='en'}>ENG</button>
    <span aria-hidden="true"/>
    <button type="button" className={language==='ur'?'is-active':''} onClick={()=>chooseLanguage('ur')} aria-pressed={language==='ur'}>اردو</button>
  </div>;
}
