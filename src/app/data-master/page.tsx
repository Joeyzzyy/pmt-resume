import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GSC 流量目标与排名工作区",
  description: "以只读方式查看 GSC 流量目标、排名诊断与点击进度。",
};

export default function DataMasterPage() {
  return (
    <div className="bg-black">
      <section className="mx-auto max-w-[1440px] px-3 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 px-1 sm:px-0">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#BD0858]">
            Read-only Workspace
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#ededed] sm:text-4xl">
              GSC 流量目标与排名工作区
            </h1>
            <span className="rounded-full border border-[#404040] bg-[#141414] px-3 py-1 text-xs font-medium text-[#a3a3a3]">
              仅阅读
            </span>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#a3a3a3]">
            此处展示自研产品「<span className="text-[#BD0858]">SEO Health Checker</span>」优化页面内容，仅支持滚动浏览；按钮、链接、表单及其他交互均已禁用。
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#262626] bg-white shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
          <iframe
            src="https://infinitegrowth.agency/gsc-goals"
            title="GSC 流量目标与排名工作区只读预览"
            className="pointer-events-none h-[6000px] w-full border-0 bg-white sm:h-[2500px]"
            sandbox="allow-scripts allow-same-origin"
            scrolling="no"
            tabIndex={-1}
            loading="eager"
          />
        </div>

        <p className="mt-4 px-1 text-xs leading-relaxed text-[#777] sm:px-0">
          内容来源：infinitegrowth.agency/gsc-goals。外部页面内容会随原站点更新。
        </p>
      </section>
    </div>
  );
}
