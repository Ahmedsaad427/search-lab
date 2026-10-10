// Real algorithm execution; every step is a snapshot recorded while the algorithm runs.
export type Algo = 'linear' | 'binary'
export type Step = { line: number; vars: Record<string, string | number>; cur: number | null; low: number | null; mid: number | null; high: number | null;
  compared: number[]; eliminated: number[]; found: number | null; done: boolean; cmp: number; iter: number; ar: string; result?: string }
export const LINEAR_CODE = ['int linearSearch(int array[], int size, int searchValue)', '{', '    for (int i = 0; i < size; i++)', '    {', '        if (searchValue == array[i])', '        {', '            return i;', '        }', '    }', '    return -1;', '}']
export const BINARY_CODE = ['int binarySearch(int array[], int size, int searchValue)', '{', '    int low = 0;', '    int high = size - 1;', '    while (low <= high)', '    {', '        int mid = (low + high) / 2;', '        if (searchValue == array[mid])', '            return mid;', '        else if (searchValue > array[mid])', '            low = mid + 1;', '        else', '            high = mid - 1;', '    }', '    return -1;', '}']
export const isSorted = (a: number[]) => a.every((v, i) => i === 0 || a[i - 1] <= v)

export function runLinear(a: number[], t: number): Step[] {
  const S: Step[] = []; const n = a.length; let cmp = 0; const compared: number[] = []
  const push = (p: Partial<Step> & { line: number; ar: string }) => S.push({ vars: {}, cur: null, low: null, mid: null, high: null, compared: [...compared], eliminated: [], found: null, done: false, cmp, iter: 0, ...p })
  for (let i = 0; i < n; i++) {
    push({ line: 2, cur: i, vars: { i, size: n, searchValue: t }, ar: `الـ loop بتتأكد إن i < size (${i} < ${n}) وهي true، فبندخل الـ loop بـ i = ${i}.` })
    cmp++
    const eq = t === a[i]
    push({ line: 4, cur: i, vars: { i, size: n, searchValue: t, 'array[i]': a[i], [`${t} == ${a[i]}`]: String(eq) }, ar: eq ? `بنقارن ${t} مع array[${i}] = ${a[i]}: النتيجة true، لقينا الـ target.` : `بنقارن ${t} مع array[${i}] = ${a[i]}: النتيجة false، يبقى نكمل للعنصر اللي بعده.` })
    if (eq) { push({ line: 6, cur: i, found: i, done: true, vars: { i, size: n, searchValue: t, 'array[i]': a[i], return: i }, ar: `الـ function بترجّع index العنصر المطابق وهو ${i} (zero-based) وبتقف فورًا.`, result: `return ${i}` }); return S }
    compared.push(i)
  }
  push({ line: 2, cur: null, vars: { i: n, size: n, searchValue: t }, ar: `i بقت ${n} فشرط i < size بقى false والـ loop خلصت.` })
  push({ line: 9, done: true, vars: { size: n, searchValue: t, return: -1 }, ar: 'مفيش عنصر طابق الـ target، فبنرجّع -1 كإشارة إن القيمة مش موجودة.', result: 'return -1' })
  return S
}

export function runBinary(a: number[], t: number): Step[] {
  const S: Step[] = []; const n = a.length; let cmp = 0, iter = 0; const compared: number[] = []
  let low = 0, high = n - 1, mid: number | null = null
  const elim = () => a.map((_, i) => i).filter(i => i < low || i > high)
  const push = (p: Partial<Step> & { line: number; ar: string }) => S.push({ vars: {}, cur: mid, low, mid, high, compared: [...compared], eliminated: elim(), found: null, done: false, cmp, iter, ...p })
  push({ line: 2, mid: null, cur: null, vars: { low }, ar: 'بنبدأ بـ low = 0، أول index في الـ array.' })
  push({ line: 3, mid: null, cur: null, vars: { low, high }, ar: `high = size - 1 = ${n} - 1 = ${high}، آخر index. الـ search range هي ${low}–${high}.` })
  while (true) {
    const ok = low <= high
    push({ line: 4, mid: null, cur: null, vars: { low, high, 'low <= high': String(ok) }, ar: ok ? `${low} <= ${high} صح، يبقى لسه فيه عناصر نبحث فيها.` : `${low} <= ${high} غلط (low > high)، يعني الـ range فضيت.` })
    if (!ok) break
    iter++; mid = Math.floor((low + high) / 2)
    push({ line: 6, vars: { low, high, mid, 'range size': high - low + 1 }, ar: `mid = (${low} + ${high}) / 2 = ${low + high} / 2 = ${mid}. الـ integer division في C++ بتشيل الكسر. العنصر في النص هو array[${mid}] = ${a[mid]}.` })
    cmp++; const eq = t === a[mid]
    push({ line: 7, vars: { low, high, mid, 'array[mid]': a[mid], [`${t} == ${a[mid]}`]: String(eq) }, ar: eq ? `${t} == ${a[mid]} صح! لقينا الـ target.` : `${t} == ${a[mid]} غلط، لازم نعرف نكمل يمين ولا شمال.` })
    if (eq) { push({ line: 8, found: mid, done: true, vars: { mid, 'array[mid]': a[mid], return: mid }, ar: `بنرجّع mid = ${mid} وبنقف.`, result: `return ${mid}` }); return S }
    compared.push(mid); cmp++; const gt = t > a[mid]
    push({ line: 9, vars: { mid, 'array[mid]': a[mid], [`${t} > ${a[mid]}`]: String(gt) }, ar: gt ? `${t} > ${a[mid]} صح، يعني الـ target أكبر والـ array Sorted، فهو أكيد في اليمين.` : `${t} > ${a[mid]} غلط، يعني الـ target أصغر فهو في الشمال.` })
    if (gt) { low = mid + 1; push({ line: 10, vars: { low, high, mid }, ar: `low = mid + 1 = ${low}. استبعدنا النص الشمال كله مع mid. الـ range بقت ${low}–${high}.` }) }
    else { high = mid - 1; push({ line: 12, vars: { low, high, mid }, ar: `high = mid - 1 = ${high}. استبعدنا النص اليمين كله مع mid. الـ range بقت ${low}–${high}.` }) }
  }
  mid = null
  push({ line: 14, done: true, cur: null, vars: { low, high, return: -1 }, ar: 'الـ range فضيت من غير ما نلاقي الـ target، فبنرجّع -1.', result: 'return -1' })
  return S
}
