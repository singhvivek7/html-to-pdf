"use client";

import { useState, useRef, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { html as htmlLang } from "@codemirror/lang-html";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import {
  Download,
  Upload,
  Eye,
  Code,
  Loader2,
  FileText,
  ArrowLeft,
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings2,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_PDF_CONFIG,
  PDF_FORMATS,
  getPageDimensionsMm,
  type PdfConfig,
} from "@/lib/pdf-config";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-sm text-zinc-500">
      Loading editor...
    </div>
  ),
});

const defaultHTML = ``;

type EditorMode = "textarea" | "codemirror";

const DESKTOP_QUERY = "(min-width: 768px)";

function subscribeToDesktopQuery(callback: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getIsDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

// SSR always sees "not desktop" (matching the mobile tab-switcher layout);
// the client re-syncs to the real viewport on first paint via
// useSyncExternalStore, without the setState-in-effect anti-pattern.
function getIsDesktopServerSnapshot() {
  return false;
}

// Desktop gets a draggable split between editor/preview; mobile keeps the
// tab switcher since there's no room for two side-by-side panels.
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeToDesktopQuery,
    getIsDesktopSnapshot,
    getIsDesktopServerSnapshot
  );
}

export default function EditorPage() {
  const [html, setHtml] = useState(defaultHTML);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [pdfConfig, setPdfConfig] = useState<PdfConfig>(DEFAULT_PDF_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("textarea");
  const previewRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDesktop = useIsDesktop();

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setHtml(content);
        };
        reader.readAsText(file);
      }
    },
    []
  );

  const handleDownloadPDF = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Rendered server-side by a real headless Chromium (see
      // app/api/generate-pdf/route.ts) so the PDF is pixel-identical to
      // the live preview, instead of a client-side rasterized approximation.
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, config: pdfConfig }),
      });

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "document.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please check your HTML for errors.");
    } finally {
      setIsGenerating(false);
    }
  }, [html, pdfConfig]);

  const handleReset = useCallback(() => {
    setHtml(defaultHTML);
  }, []);

  const updateMargin = (side: keyof PdfConfig, value: string) => {
    const num = Number(value);
    setPdfConfig((prev) => ({
      ...prev,
      [side]: Number.isFinite(num) ? Math.min(Math.max(num, 0), 50) : 0,
    }));
  };

  const pageMm = getPageDimensionsMm(pdfConfig);

  const editorPanel = (wrapperClassName: string) => (
    <div className={wrapperClassName}>
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4 text-primary" />
          <span>index.html</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {html.length.toLocaleString()} characters
          </span>
          <Select
            value={editorMode}
            onValueChange={(value) => setEditorMode(value as EditorMode)}
          >
            <SelectTrigger size="sm" className="h-7 text-xs" title="Editor">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="textarea">Plain Text</SelectItem>
              <SelectItem value="codemirror">Code Editor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="relative flex-1">
        {editorMode === "codemirror" ? (
          <CodeMirror
            height="100%"
            theme={vscodeDark}
            extensions={[htmlLang()]}
            value={html}
            onChange={(value) => setHtml(value)}
            className="h-full text-[13px] [&_.cm-editor]:h-full"
          />
        ) : (
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            spellCheck={false}
            className="h-full w-full resize-none bg-zinc-950 p-4 font-mono text-[13px] text-zinc-100 outline-none"
          />
        )}
      </div>
    </div>
  );

  const previewPanel = (wrapperClassName: string, showFullscreenToggle: boolean) => (
    <div className={wrapperClassName}>
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Eye className="h-4 w-4 text-primary" />
          <span>Preview</span>
        </div>
        {showFullscreenToggle && (
          <button
            onClick={() => setIsFullPreview(!isFullPreview)}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={isFullPreview ? "Exit fullscreen" : "Fullscreen preview"}
          >
            {isFullPreview ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto bg-zinc-100 p-4 dark:bg-zinc-900">
        {/* Box mirrors the selected page format's aspect ratio, with the
            margins rendered as real proportional space, so the preview
            visually matches what the server will actually produce. */}
        <div
          className="relative mx-auto bg-white shadow-lg"
          style={{
            aspectRatio: `${pageMm.width} / ${pageMm.height}`,
            width: "100%",
            maxWidth: "700px",
          }}
        >
          <div
            className="absolute overflow-hidden rounded-lg"
            style={{
              top: `${(pdfConfig.marginTop / pageMm.height) * 100}%`,
              right: `${(pdfConfig.marginRight / pageMm.width) * 100}%`,
              bottom: `${(pdfConfig.marginBottom / pageMm.height) * 100}%`,
              left: `${(pdfConfig.marginLeft / pageMm.width) * 100}%`,
            }}
          >
            <iframe
              ref={previewRef}
              srcDoc={html}
              className="h-full w-full"
              title="Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-primary">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span className="font-display text-sm font-semibold uppercase tracking-wide">RenderPDF</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload HTML</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            title="Reset to template"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen((open) => !open)}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
              title="PDF settings"
            >
              <Settings2 className="h-4 w-4" />
            </button>
            {isSettingsOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsSettingsOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-border bg-card p-4 shadow-lg">
                  <h3 className="font-display mb-3 text-sm font-semibold uppercase tracking-wide">PDF Settings</h3>

                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Page Size
                  </label>
                  <select
                    value={pdfConfig.format}
                    onChange={(e) =>
                      setPdfConfig((prev) => ({
                        ...prev,
                        format: e.target.value as PdfConfig["format"],
                      }))
                    }
                    className="mb-3 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                  >
                    {PDF_FORMATS.map((format) => (
                      <option key={format} value={format}>
                        {format.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Orientation
                  </label>
                  <div className="mb-3 flex gap-2">
                    {(["portrait", "landscape"] as const).map((orientation) => (
                      <button
                        key={orientation}
                        onClick={() =>
                          setPdfConfig((prev) => ({ ...prev, orientation }))
                        }
                        className={`flex-1 rounded-md border px-2 py-1.5 text-sm capitalize transition-colors ${
                          pdfConfig.orientation === orientation
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:bg-muted"
                        }`}
                      >
                        {orientation}
                      </button>
                    ))}
                  </div>

                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Margins (mm)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["marginTop", "Top"],
                        ["marginRight", "Right"],
                        ["marginBottom", "Bottom"],
                        ["marginLeft", "Left"],
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key}>
                        <span className="text-[11px] text-muted-foreground">
                          {label}
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={pdfConfig[key]}
                          onChange={(e) => updateMargin(key, e.target.value)}
                          className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="font-display flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isGenerating ? "Generating..." : "Download PDF"}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      {!isDesktop && !isFullPreview && (
        <div className="flex border-b border-border bg-card md:hidden">
          <button
            onClick={() => setActiveTab("code")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "code"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground"
            }`}
          >
            <Code className="h-4 w-4" />
            Code
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "preview"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground"
            }`}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>
      )}

      {/* Main Content */}
      {isFullPreview ? (
        <div className="flex flex-1 overflow-hidden">
          {previewPanel("flex w-full flex-col", true)}
        </div>
      ) : isDesktop ? (
        <ResizablePanelGroup orientation="horizontal" className="flex-1 overflow-hidden">
          <ResizablePanel defaultSize={50} minSize={20}>
            {editorPanel("flex h-full flex-col")}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={20}>
            {previewPanel("flex h-full flex-col", true)}
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {editorPanel(
            `w-full flex-col ${activeTab === "code" ? "flex" : "hidden"}`
          )}
          {previewPanel(
            `w-full flex-col ${activeTab === "preview" ? "flex" : "hidden"}`,
            false
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-border bg-card px-4 py-2 text-xs text-muted-foreground">
        <span>Created with <span className="text-rose-500">love</span> by <Link href="https://github.com/singhvivek7" className="text-rose-500">@singhvivek7</Link></span>
        <span className="uppercase">
          {pdfConfig.format} {pdfConfig.orientation}
        </span>
      </footer>
    </div>
  );
}
