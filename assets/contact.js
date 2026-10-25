const email=window.ARCADE_CONFIG?.contactEmail;
if(email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
 const p=document.createElement('p'),a=document.createElement('a');a.href='mailto:'+email;a.textContent=email;p.append(a);document.getElementById('contact-details').replaceChildren(p);
}
