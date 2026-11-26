import { certificateMotto, certificateSigner } from "@/content/certificate";

/**
 * The certificate as a web preview, matching the PDF: three rounded panels on warm paper
 * with a blue band behind. Sizes are in container units so it scales to any width.
 */
export function CertificatePreview({ name, course, school, date, code }: { name: string; course: string; school?: string; date?: string; code?: string }) {
  const cq = (n: number) => `${(n / 842) * 100}cqw`;
  return (
    <div className="@container w-full text-left">
      <div
        className="relative grid aspect-[842/595] w-full grid-cols-[236fr_512fr] grid-rows-[150fr_333fr] overflow-hidden rounded-md text-[#111] shadow-[0_10px_30px_rgba(11,31,58,0.18)]"
        style={{ background: "linear-gradient(to top, #3454aa 0 37.3%, #eeece6 37.3%)", padding: cq(38), gap: cq(18), fontSize: cq(11) }}
        role="img"
        aria-label={`Certificate of completion awarded to ${name} for ${course}`}
      >
        <div className="relative flex flex-col border border-[#111] bg-[#eeece6]" style={{ borderRadius: cq(16), padding: `${cq(30)} ${cq(22)}` }}>
          {certificateMotto.map((l) => <span key={l} className="font-bold leading-tight" style={{ fontSize: cq(14) }}>{l}</span>)}
          <svg viewBox="-24 -24 48 48" className="absolute" style={{ width: cq(44), right: cq(36), bottom: cq(22) }} aria-hidden="true">
            {[0, 45, 90, 135].map((a) => <rect key={a} x="-3.75" y="-22" width="7.5" height="44" fill="#3454aa" transform={`rotate(${a})`} />)}
          </svg>
        </div>
        <div className="flex flex-col border border-[#111] bg-[#d6eaf0]" style={{ borderRadius: cq(16), padding: `${cq(24)} ${cq(26)}` }}>
          <span className="flex items-center font-bold" style={{ fontSize: cq(10.5), gap: cq(8) }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/strongs-logo.webp" alt="" style={{ width: cq(20), height: cq(20) }} className="rounded-full" />
            STRONGS · The Spiritual Intellectuals
          </span>
          <span className="font-black uppercase leading-none tracking-tight" style={{ fontSize: cq(50), marginTop: cq(14) }}>Certificate</span>
          <span className="font-bold" style={{ fontSize: cq(17), marginTop: cq(4) }}>of Completion</span>
        </div>
        <div className="col-span-2 grid grid-cols-[2fr_1fr] border border-[#111] bg-[#eeece6]" style={{ borderRadius: cq(16), padding: `${cq(40)} ${cq(34)}` }}>
          <div className="flex flex-col justify-center border-r border-[#c8c8c4]" style={{ paddingRight: cq(30), gap: cq(6) }}>
            <span className="font-semibold" style={{ fontSize: cq(13) }}>Proudly awarded to</span>
            <span className="font-extrabold leading-tight" style={{ fontSize: cq(36) }}>{name}</span>
            <span className="flex flex-col font-semibold" style={{ marginTop: cq(10), paddingLeft: cq(30), fontSize: cq(11), position: "relative" }}>
              <span aria-hidden="true" className="absolute left-0 bg-[#3454aa]" style={{ top: cq(8), width: cq(18), height: 1 }} />
              {school === "theology" ? "For completing the STRONGS School of Theology course" : "For completing the STRONGS course"}
              <span className="font-bold leading-snug" style={{ fontSize: cq(16) }}>{course}</span>
              {date && <span>Completed on {date}.</span>}
            </span>
            {code && <span className="text-[#555]" style={{ fontSize: cq(9), marginTop: cq(12) }}>Certificate no. {code}</span>}
          </div>
          <div className="flex flex-col justify-between" style={{ paddingLeft: cq(34) }}>
            <svg viewBox="0 0 82 18" className="self-end" style={{ width: cq(82) }} aria-hidden="true">
              {[2, 9, 16].map((y) => <path key={y} d={`M0 ${y} q5 -4 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0`} fill="none" stroke="#3454aa" strokeWidth="1.8" />)}
            </svg>
            <span className="flex flex-col">
              <span className="border-t border-[#111]" style={{ width: "80%", marginBottom: cq(8) }} />
              <span className="font-bold" style={{ fontSize: cq(10.5) }}>{certificateSigner.name}</span>
              <span style={{ fontSize: cq(9.5) }}>{certificateSigner.role}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
