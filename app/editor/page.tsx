"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  FileCode,
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
} from "lucide-react";

const defaultHTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      background: white;
      color: #1a1a1a;
    }
    .invoice {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f97316;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #f97316;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      font-size: 32px;
      color: #1a1a1a;
    }
    .invoice-title p {
      color: #666;
      margin-top: 5px;
    }
    .details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .details-section h3 {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .details-section p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #f8f8f8;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e5e5;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e5e5;
    }
    .amount {
      text-align: right;
    }
    .total-row td {
      font-weight: bold;
      font-size: 18px;
      border-bottom: none;
      padding-top: 20px;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">ACME Inc.</div>
      <div class="invoice-title">
        <h1>INVOICE</h1>
        <p>#INV-2024-001</p>
      </div>
    </div>

    <div class="details">
      <div class="details-section">
        <h3>Bill To</h3>
        <p><strong>John Doe</strong></p>
        <p>123 Main Street</p>
        <p>New York, NY 10001</p>
        <p>john@example.com</p>
      </div>
      <div class="details-section">
        <h3>Invoice Details</h3>
        <p><strong>Date:</strong> November 28, 2025</p>
        <p><strong>Due Date:</strong> December 28, 2025</p>
        <p><strong>Status:</strong> Pending</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th class="amount">Price</th>
          <th class="amount">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Web Design Services</td>
          <td>1</td>
          <td class="amount">$1,500.00</td>
          <td class="amount">$1,500.00</td>
        </tr>
        <tr>
          <td>Frontend Development</td>
          <td>40 hrs</td>
          <td class="amount">$75.00</td>
          <td class="amount">$3,000.00</td>
        </tr>
        <tr>
          <td>Backend API Integration</td>
          <td>20 hrs</td>
          <td class="amount">$85.00</td>
          <td class="amount">$1,700.00</td>
        </tr>
        <tr class="total-row">
          <td colspan="3">Total</td>
          <td class="amount">$6,200.00</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>Payment is due within 30 days. Please include invoice number with payment.</p>
    </div>
  </div>
</body>
</html>`;

export default function EditorPage() {
  const [html, setHtml] = useState(defaultHTML);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [isFullPreview, setIsFullPreview] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Use browser print dialog with an isolated iframe
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (!printWindow) {
        alert("Please allow popups to download PDF");
        return;
      }

      // Inject print styles to force background colors to show
      const printStyles = `
        <style>
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        </style>
      `;

      // Insert print styles before closing </head> or at the start of HTML
      let modifiedHtml = html;
      if (html.includes("</head>")) {
        modifiedHtml = html.replace("</head>", `${printStyles}</head>`);
      } else if (html.includes("<body")) {
        modifiedHtml = html.replace("<body", `${printStyles}<body`);
      } else {
        modifiedHtml = printStyles + html;
      }

      printWindow.document.write(modifiedHtml);
      printWindow.document.close();

      // Wait for content to load
      await new Promise((resolve) => setTimeout(resolve, 300));

      printWindow.focus();
      printWindow.print();

      // Close the window after a delay (user may cancel print)
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please check your HTML for errors.");
    } finally {
      setIsGenerating(false);
    }
  }, [html]);

  const handleReset = useCallback(() => {
    setHtml(defaultHTML);
  }, []);

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
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
              <FileCode className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">HTML to PDF</span>
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
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isGenerating ? "Opening..." : "Print / Save PDF"}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex border-b border-border bg-card md:hidden">
        <button
          onClick={() => setActiveTab("code")}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "code"
              ? "border-b-2 border-orange-500 text-foreground"
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
              ? "border-b-2 border-orange-500 text-foreground"
              : "text-muted-foreground"
          }`}
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Editor Panel */}
        <div
          className={`flex flex-col border-r border-border ${
            isFullPreview ? "hidden" : ""
          } ${
            activeTab === "code" ? "flex" : "hidden"
          } w-full md:flex md:w-1/2`}
        >
          <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-orange-500" />
              <span>index.html</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {html.length.toLocaleString()} characters
            </span>
          </div>
          <div className="relative flex-1">
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="h-full w-full resize-none bg-zinc-950 p-4 font-mono text-sm text-zinc-300 focus:outline-none"
              spellCheck={false}
              placeholder="Enter your HTML here..."
            />
          </div>
        </div>

        {/* Preview Panel */}
        <div
          className={`flex flex-col ${isFullPreview ? "w-full" : ""} ${
            activeTab === "preview" ? "flex" : "hidden"
          } w-full md:flex md:w-1/2`}
        >
          <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Eye className="h-4 w-4 text-blue-500" />
              <span>Preview</span>
            </div>
            <button
              onClick={() => setIsFullPreview(!isFullPreview)}
              className="hidden rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:block"
              title={isFullPreview ? "Exit fullscreen" : "Fullscreen preview"}
            >
              {isFullPreview ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-zinc-100 p-4 dark:bg-zinc-900">
            <div className="mx-auto min-h-full max-w-4xl rounded-lg bg-white shadow-lg">
              <iframe
                ref={previewRef}
                srcDoc={html}
                className="h-full min-h-[600px] w-full rounded-lg"
                title="Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-border bg-card px-4 py-2 text-xs text-muted-foreground">
        <span>Created with <span className="text-rose-500">love</span> by <Link href="https://github.com/singhvivek7" className="text-rose-500">@singhvivek7</Link></span>
        <span>A4 Portrait</span>
      </footer>
    </div>
  );
}
