import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward, Maximize2, Minimize2, Shuffle, ArrowDownUp, Plus, Minus, Undo2 } from 'lucide-react'
import { runLinear, runBinary, isSorted, LINEAR_CODE, BINARY_CODE, type Algo } from './engine'

const EX = { linear: { a: [15, 23, 7, 45, 87, 16], t: 45 }, binary: { a: [12, 22, 34, 47, 55, 67, 82, 98], t: 67 } }
const EXPERIMENTS = [
  { n: 'A: Target at beginning', f: (a: number[]) => a[0] }, { n: 'B: Target at end (sorted)', f: (a: number[]) => a[a.length - 1], sort: true },
  { n: 'C: Target absent', f: (a: number[]) => Math.max(...a) + 5 }, { n: 'E: Shuffle (unsorted)', f: (a: number[]) => a[2] ?? 0, shuffle: true },
]

export default function App() {
  const [algo, setAlgo] = useState<Algo>('linear')
  const [arr, setArr] = useState(EX.linear.a); const [t, setT] = useState(EX.linear.t)
  const [idx, setIdx] = useState(-1); const [play, setPlay] = useState(false); const [speed, setSpeed] = useState(1000); const [pres, setPres] = useState(false)
  const sorted = isSorted(arr); const blocked = algo === 'binary' && !sorted
  const steps = useMemo(() => blocked ? [] : algo === 'linear' ? runLinear(arr, t) : runBinary(arr, t), [algo, arr, t, blocked])
  const code = algo === 'linear' ? LINEAR_CODE : BINARY_CODE
  const last = steps.length - 1; const s = idx >= 0 ? steps[Math.min(idx, last)] : undefined
  const next = () => setIdx(i => Math.min(i + 1, last)); const prev = () => setIdx(i => Math.max(i - 1, -1)); const reset = () => { setIdx(-1); setPlay(false) }
  const setData = (a: number[], tt = t) => { setArr(a); setT(tt); reset() }
  useEffect(() => { if (!play) return; if (idx >= last) { setPlay(false); return } const id = setTimeout(next, speed); return () => clearTimeout(id) }, [play, idx, speed, last])
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') prev(); else if (e.key === ' ') { e.preventDefault(); setPlay(p => !p) } else if (e.key.toLowerCase() === 'r') reset() }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [last])
  const state = (i: number) => !s ? 'default' : s.found === i ? 'found' : s.done && s.found === null && algo === 'linear' ? 'notfound' : s.cur === i ? 'current' : s.eliminated.includes(i) ? 'elim' : s.compared.includes(i) ? 'compared' : 'default'
  const cls: Record<string, string> = { default: 'border-slate-500 bg-slate-800', current: 'border-cyan-400 bg-cyan-900', compared: 'border-purple-400 bg-purple-950', elim: 'border-slate-700 bg-slate-900 opacity-35', found: 'border-green-400 bg-green-800', notfound: 'border-red-500 bg-red-950' }
  const sw = (a: Algo) => { setAlgo(a); setData(EX[a].a, EX[a].t) }
  const cell = pres ? 'w-24 h-24 text-4xl' : 'w-16 h-16 text-2xl'
  return (
    <div className="p-3 min-h-screen">
      <div className="flex flex-wrap gap-2 items-center mb-3">
        {!pres && <h1 className="text-xl font-bold text-cyan-300 mr-3">Array Searching Lab</h1>}
        {(['linear', 'binary'] as Algo[]).map(a => <button key={a} onClick={() => sw(a)} className={`btn ${algo === a ? 'bg-cyan-700' : ''}`}>{a === 'linear' ? 'Linear Search' : 'Binary Search'}</button>)}
        <button className="btn" onClick={prev}><SkipBack size={16} /></button>
        <button className="btn" disabled={blocked} onClick={() => { if (idx >= last) setIdx(-1); setPlay(p => !p) }}>{play ? <Pause size={16} /> : <Play size={16} />}</button>
        <button className="btn" onClick={next}><SkipForward size={16} /></button>
        <button className="btn" onClick={reset}><RotateCcw size={16} /></button>
        <button className="btn" disabled={blocked} onClick={() => { setPlay(false); setIdx(last) }}><FastForward size={16} /> Run</button>
        <label className="text-sm">Speed <input type="range" min={200} max={2000} step={100} value={2200 - speed} onChange={e => setSpeed(2200 - +e.target.value)} /></label>
        <button className="btn" onClick={() => { const d = document.documentElement; setPres(p => !p); if (!pres) d.requestFullscreen?.().catch(() => {}); else if (document.fullscreenElement) document.exitFullscreen() }}>{pres ? <Minimize2 size={16} /> : <Maximize2 size={16} />} Presentation</button>
        <span className="text-xs text-slate-400">Keys: ← → Space R</span>
      </div>
      {!pres && <div className="flex flex-wrap gap-2 items-center mb-3 bg-slate-900 border border-slate-700 rounded p-2">
        <label className="text-sm">target <input type="number" value={t} onChange={e => { setT(+e.target.value || 0); reset() }} className="w-20 bg-slate-800 rounded px-1" /></label>
        <button className="btn" onClick={() => setData([...arr, (arr[arr.length - 1] ?? 0) + 10])} disabled={arr.length >= 20}><Plus size={16} /></button>
        <button className="btn" onClick={() => setData(arr.slice(0, -1))}><Minus size={16} /></button>
        <button className="btn" onClick={() => setData(Array.from({ length: arr.length }, () => Math.floor(Math.random() * 99) + 1))}><Shuffle size={16} /> Randomize</button>
        <button className="btn" onClick={() => setData([...arr].sort((x, y) => x - y))}><ArrowDownUp size={16} /> Sort Array</button>
        <button className="btn" onClick={() => setData(EX[algo].a, EX[algo].t)}><Undo2 size={16} /> Restore Example</button>
        {EXPERIMENTS.map(e => <button key={e.n} className="btn text-xs" onClick={() => { let a = algo === 'binary' ? EX.binary.a : arr; a = e.shuffle ? [...a].reverse().map((v, i) => (i % 2 ? v : a[(i + 3) % a.length])) : e.sort ? [...a].sort((x, y) => x - y) : a; setData(a, e.f(a)) }}>{e.n}</button>)}
      </div>}
      {blocked && <div className="ar bg-amber-950 border border-amber-500 rounded p-3 mb-3 text-amber-200">⚠ الـ Binary Search محتاجة array مترتبة تصاعديًا (Sorted)، لأننا بنستبعد نص الـ range بناءً على مقارنة واحدة بالـ mid. استخدم Sort Array أو Restore Example.</div>}
      <div className="bg-slate-900 border border-slate-700 rounded p-4 mb-3 overflow-x-auto">
        <div className="flex gap-2 justify-center min-w-max pt-8">
          {arr.length === 0 && <div className="text-slate-400">Empty array (size = 0)</div>}
          {arr.map((v, i) => <div key={i} className="relative flex flex-col items-center">
            <div className="absolute -top-8 flex gap-1 text-xs font-bold">
              {s?.low === i && <span className="text-blue-300">low</span>}{s?.mid === i && <span className="text-cyan-300">mid</span>}{s?.high === i && <span className="text-amber-300">high</span>}
              {algo === 'linear' && s?.cur === i && <span className="text-cyan-300">i ▼</span>}</div>
            <motion.div animate={{ scale: state(i) === 'current' ? 1.12 : 1 }} className={`${cell} border-2 rounded flex items-center justify-center font-mono ${cls[state(i)]}`}>
              {pres || <input type="number" value={v} onChange={e => { const a = [...arr]; a[i] = +e.target.value || 0; setData(a) }} className="w-full h-full bg-transparent text-center outline-none" />}
              {pres && v}</motion.div>
            <div className="text-xs text-slate-400 mt-1">{i}</div></div>)}
        </div>
        <div className="flex flex-wrap gap-3 text-xs mt-3 justify-center text-slate-400"><span>■ default</span><span className="text-cyan-300">■ current</span><span className="text-purple-300">■ compared</span><span>■ eliminated (dim)</span><span className="text-green-300">■ found</span><span className="text-red-400">■ not found</span></div>
      </div>
      <div className={`grid gap-3 ${pres ? 'lg:grid-cols-1' : 'lg:grid-cols-[1fr_300px]'}`}>
        <div className="grid md:grid-cols-2 gap-3">
          <pre className={`bg-slate-950 border border-slate-700 rounded p-2 font-mono ${pres ? 'text-lg' : 'text-sm'}`}>{code.map((l, i) => <div key={i} className={`whitespace-pre ${s?.line === i ? 'bg-cyan-900' : ''}`}>{l || ' '}</div>)}</pre>
          <div className="space-y-3">
            <div className="bg-slate-900 border border-slate-700 rounded p-3"><h3 className="text-sm text-slate-400 mb-1">Variables</h3>
              {s ? Object.entries(s.vars).map(([k, v]) => <div key={k} className="font-mono text-sm flex justify-between"><span>{k}</span><span className="text-cyan-300">{String(v)}</span></div>) : <div className="text-slate-500 text-sm">Press Next Step</div>}
              <div className="mt-2 pt-2 border-t border-slate-700 font-mono text-sm">comparisons: <b className="text-amber-300">{s?.cmp ?? 0}</b>{algo === 'binary' && <> · iterations: <b>{s?.iter ?? 0}</b> · range: <b>{s && s.low !== null && s.high !== null ? (s.low <= s.high ? `${s.low}–${s.high}` : 'empty') : '—'}</b></>}</div></div>
            {s?.result && <div className={`rounded p-3 font-mono border ${s.found !== null ? 'border-green-500 bg-green-950' : 'border-red-500 bg-red-950'}`}>{s.result}</div>}
          </div>
          <div className="ar md:col-span-2 bg-slate-900 border border-slate-700 rounded p-3 text-lg min-h-[64px]">{s ? s.ar : 'اضغط Next Step عشان نبدأ الـ algorithm خطوة خطوة.'}</div>
        </div>
        {!pres && <div className="bg-slate-900 border border-slate-700 rounded p-3 max-h-80 overflow-auto"><h3 className="text-sm text-slate-400 mb-1">History</h3>
          {steps.slice(0, idx + 1).map((x, i) => <div key={i} onClick={() => setIdx(i)} className={`text-xs font-mono cursor-pointer ${i === idx ? 'text-cyan-300' : 'text-slate-400'}`}>{i + 1}. line {x.line + 1} · cmp {x.cmp}</div>)}</div>}
      </div>
      {!pres && <div className="mt-3 text-xs text-slate-400 ar">Linear: best O(1)، average/worst O(n). Binary: best O(1)، average/worst O(log n) (لازم Sorted). Big-O بيوصف معدل النمو مش الزمن الفعلي. عدد المقارنات بيعتمد على الـ input ومكان الـ target. مع Duplicates الـ Linear بترجّع أول عنصر، لكن الـ Binary ممكن ترجّع أي occurrence.</div>}
    </div>)
}
