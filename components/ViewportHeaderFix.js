'use client';

import {useEffect} from 'react';

export default function ViewportHeaderFix(){
  useEffect(()=>{
    const original=document.querySelector('.reel-site.static-reference-site .ref-nav');
    if(!original) return;

    const host=document.createElement('div');
    host.className='static-reference-site viewport-nav-host';

    const clone=original.cloneNode(true);
    clone.classList.add('ref-nav-viewport');
    clone.setAttribute('aria-label','Primary navigation');

    host.appendChild(clone);
    document.body.appendChild(host);
    original.setAttribute('data-viewport-nav-source','true');

    return()=>{
      original.removeAttribute('data-viewport-nav-source');
      host.remove();
    };
  },[]);

  return null;
}
