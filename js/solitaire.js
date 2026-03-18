  // ========== SOLITAIRE ==========
  const Solitaire = (() => {
    const SUITS = ['H','D','S','C'];
    const SYM   = {H:'♥',D:'♦',S:'♠',C:'♣'};
    const VALS  = [null,'A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const isRed = s => s==='H'||s==='D';

    let stock, waste, found, tab, sel, hist, score;

    function init() {
      let deck = [];
      for (const s of SUITS) for (let v=1;v<=13;v++) deck.push({s,v,up:false});
      for (let i=deck.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
      tab=Array.from({length:7},()=>[]); found=Array.from({length:4},()=>[]);
      waste=[]; sel=null; hist=[]; score=0;
      for (let i=0;i<7;i++) for (let j=0;j<=i;j++) { const c=deck.pop(); if(j===i)c.up=true; tab[i].push(c); }
      stock=deck;
      save(); render();
    }

    const clonePile = p => p.map(c=>({...c}));

    function save() {
      hist.push({stock:clonePile(stock),waste:clonePile(waste),found:found.map(clonePile),tab:tab.map(clonePile),score});
      if (hist.length>60) hist.shift();
    }

    function undo() {
      if (hist.length<=1) return;
      hist.pop();
      const s=hist[hist.length-1];
      stock=clonePile(s.stock); waste=clonePile(s.waste);
      found=s.found.map(clonePile); tab=s.tab.map(clonePile); score=s.score;
      sel=null; render();
    }

    function draw() {
      if (!stock.length) { if (!waste.length) return; stock=waste.reverse().map(c=>({...c,up:false})); waste=[]; }
      const c=stock.pop(); c.up=true; waste.push(c);
      sel=null; save(); render();
    }

    const canTab   = (c,t) => !t ? c.v===13 : isRed(c.s)!==isRed(t.s) && c.v===t.v-1;
    const canFound = (c,p) => !p.length ? c.v===1 : c.s===p[p.length-1].s && c.v===p[p.length-1].v+1;

    function click(type,idx,ci) {
      if (type==='stock') { sel=null; draw(); return; }
      if (sel && sel.type===type && sel.idx===idx && (type!=='t'||sel.ci===ci)) { sel=null; render(); return; }
      if (sel) { if (tryMove(sel,{type,idx,ci})) { sel=null; return; } }
      if (type==='waste'&&waste.length) sel={type:'waste'};
      else if (type==='t') { const p=tab[idx]; if(ci>=0&&ci<p.length&&p[ci].up) sel={type:'t',idx,ci}; else sel=null; }
      else if (type==='f'&&found[idx].length) sel={type:'f',idx};
      else sel=null;
      render();
    }

    function tryMove(src,dest) {
      let cards,srcPile;
      if (src.type==='waste') { if(!waste.length)return false; cards=[waste[waste.length-1]]; srcPile=waste; }
      else if (src.type==='t') { const p=tab[src.idx]; cards=p.slice(src.ci); srcPile=p; }
      else return false;
      if (!cards.length) return false;
      const top=cards[0]; let ok=false;
      if (dest.type==='f') {
        if (cards.length!==1) return false;
        if (canFound(top,found[dest.idx])) { found[dest.idx].push(srcPile.pop()); score+=10; ok=true; }
      } else if (dest.type==='t') {
        if (src.type==='t'&&dest.idx===src.idx) return false;
        const dp=tab[dest.idx];
        if (canTab(top, dp.length?dp[dp.length-1]:null)) {
          const mv = src.type==='t' ? tab[src.idx].splice(src.ci) : [waste.pop()];
          tab[dest.idx].push(...mv);
          if (src.type==='waste') score+=5;
          ok=true;
        }
      }
      if (ok) {
        if (src.type==='t') { const p=tab[src.idx]; if(p.length&&!p[p.length-1].up){p[p.length-1].up=true;score+=5;} }
        save(); render(); checkWin(); return true;
      }
      return false;
    }

    function autoMove(type,idx,ci) {
      let card,pile;
      if (type==='waste') { if(!waste.length)return; card=waste[waste.length-1]; pile=waste; }
      else if (type==='t') { const p=tab[idx]; if(ci!==p.length-1||!p[ci].up)return; card=p[ci]; pile=p; }
      else return;
      for (let fi=0;fi<4;fi++) {
        if (canFound(card,found[fi])) {
          found[fi].push(pile.pop()); score+=10;
          if (type==='t'){const p=tab[idx];if(p.length&&!p[p.length-1].up){p[p.length-1].up=true;score+=5;}}
          sel=null; save(); render(); checkWin(); return;
        }
      }
    }

    function checkWin() {
      if (found.every(p=>p.length===13)) {
        setTimeout(()=>{
          const b=document.getElementById('sol-game-body');
          if(b) b.innerHTML=`<div style="text-align:center;padding:60px 20px;font-family:'VT323'"><div style="font-size:52px;color:#7ac47a">🎉 YOU WIN! 🎉</div><div style="font-size:24px;color:var(--text-mid);margin:12px 0">Final Score: ${score}</div><button class="sol-btn" style="font-size:20px;padding:6px 20px" onclick="Solitaire.newGame()">Play Again</button></div>`;
        },400);
      }
    }

    function mkCard(card,onCk,onDbl,isSel) {
      const el=document.createElement('div');
      el.className=`sol-card${card.up?(isRed(card.s)?' red':' black'):' face-down'}${isSel?' sol-sel':''}`;
      if (card.up) {
        const v=VALS[card.v],s=SYM[card.s];
        el.innerHTML=`<span class="sol-tl">${v}<br>${s}</span><span class="sol-br">${v}<br>${s}</span>`;
      }
      if (onCk)  el.onclick  = onCk;
      if (onDbl) el.ondblclick = e=>{e.stopPropagation();onDbl();};
      return el;
    }

    function mkEmpty(onCk,label) {
      const el=document.createElement('div'); el.className='sol-empty';
      if (label) el.textContent=label;
      if (onCk)  el.onclick=onCk;
      return el;
    }

    function render() {
      const sc=document.getElementById('sol-score'); if(sc) sc.textContent=score;

      // Stock
      const stockEl=document.getElementById('sol-stock');
      if (stockEl) {
        stockEl.innerHTML='';
        if (stock.length) {
          const c=mkCard({s:'S',v:0,up:false},()=>click('stock'));
          c.title=`${stock.length} cards remaining`; stockEl.appendChild(c);
        } else { stockEl.appendChild(mkEmpty(()=>click('stock'),'↺')); }
      }

      // Waste
      const wasteEl=document.getElementById('sol-waste');
      if (wasteEl) {
        wasteEl.innerHTML='';
        if (waste.length) {
          const c=mkCard(waste[waste.length-1],()=>click('waste'),()=>autoMove('waste'),sel?.type==='waste');
          wasteEl.appendChild(c);
        } else { wasteEl.appendChild(mkEmpty(null,'')); }
      }

      // Foundations
      for (let i=0;i<4;i++) {
        const el=document.getElementById(`sol-f${i}`); if(!el) continue;
        el.innerHTML='';
        if (found[i].length) { el.appendChild(mkCard(found[i][found[i].length-1],()=>click('f',i))); }
        else { el.appendChild(mkEmpty(()=>click('f',i),['♥','♦','♠','♣'][i])); }
      }

      // Tableau
      for (let i=0;i<7;i++) {
        const el=document.getElementById(`sol-t${i}`); if(!el) continue;
        el.innerHTML='';
        const pile=tab[i];
        if (!pile.length) { el.style.height='82px'; el.appendChild(mkEmpty(()=>click('t',i,0),'')); continue; }
        el.style.height=(pile.length*22+58)+'px';
        pile.forEach((card,j)=>{
          const isSel=sel?.type==='t'&&sel.idx===i&&j>=sel.ci;
          const c=card.up
            ? mkCard(card,()=>click('t',i,j),()=>autoMove('t',i,j),isSel)
            : mkCard(card,null);
          c.style.position='absolute'; c.style.top=(j*22)+'px'; c.style.zIndex=j+1;
          el.appendChild(c);
        });
      }
    }

    return { init, undo, newGame: init };
  })();

  Solitaire.init();
