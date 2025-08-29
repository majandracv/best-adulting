"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { errorReporting, type ErrorReport, type UserFeedback } from "@/lib/error-reporting"
import { AlertTriangle, MessageSquare, Trash2, Copy, Download } from "lucide-react"
import { feedback } from "@/lib/feedback-system"

export function ErrorReportViewer() {
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([])
  const [userFeedback, setUserFeedback] = useState<UserFeedback[]>([])

  useEffect(() => {
    setErrorReports(errorReporting.getStoredReports())
    setUserFeedback(errorReporting.getStoredFeedback())
  }, [])

  const handleClearData = () => {
    errorReporting.clearStoredData()
    setErrorReports([])
    setUserFeedback([])
  }

  const handleCopyReport = (report: ErrorReport) => {
    const reportText = `
Error Report
============
ID: ${report.id}
Time: ${report.timestamp}
Error: ${report.error.name}: ${report.error.message}
URL: ${report.context.url}
User Agent: ${report.context.userAgent}
Session: ${report.context.sessionId}

Stack Trace:
${report.error.stack || "No stack trace available"}

Metadata:
${JSON.stringify(report.metadata, null, 2)}
    `.trim()

    navigator.clipboard?.writeText(reportText).then(() => {
      feedback.success("Report copied to clipboard")
    })
  }

  const handleExportData = () => {
    const data = {
      errorReports,
      userFeedback,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `best-adulting-feedback-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    feedback.success("Data exported successfully")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Error Reports & Feedback</h2>
          <p className="text-sm text-muted-foreground">
            {errorReports.length} error reports, {userFeedback.length} feedback items
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearData}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Error Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Error Reports ({errorReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errorReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No error reports found</p>
          ) : (
            <div className="space-y-3">
              {errorReports.slice(-10).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive" className="text-xs">
                        {report.error.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{report.error.message}</p>
                    <p className="text-xs text-muted-foreground truncate">{report.context.url}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleCopyReport(report)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Error Report Details</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-96">
                          <div className="space-y-4 text-sm">
                            <div>
                              <strong>Error:</strong> {report.error.name}: {report.error.message}
                            </div>
                            <div>
                              <strong>Time:</strong> {new Date(report.timestamp).toLocaleString()}
                            </div>
                            <div>
                              <strong>URL:</strong> {report.context.url}
                            </div>
                            <div>
                              <strong>Session:</strong> {report.context.sessionId}
                            </div>
                            {report.error.stack && (
                              <div>
                                <strong>Stack Trace:</strong>
                                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                  {report.error.stack}
                                </pre>
                              </div>
                            )}
                            {report.metadata && (
                              <div>
                                <strong>Metadata:</strong>
                                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                  {JSON.stringify(report.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            User Feedback ({userFeedback.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userFeedback.length === 0 ? (
            <p className="text-sm text-muted-foreground">No user feedback found</p>
          ) : (
            <div className="space-y-3">
              {userFeedback.slice(-10).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={item.type === "bug" ? "destructive" : "default"} className="text-xs">
                        {item.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{item.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Badge variant={item.type === "bug" ? "destructive" : "default"}>{item.type}</Badge>
                          <Badge variant="outline">{item.category}</Badge>
                          <Badge variant="outline">{item.priority} priority</Badge>
                        </div>
                        <div>
                          <strong>Description:</strong>
                          <p className="mt-1 text-sm">{item.description}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p>Submitted: {new Date(item.timestamp).toLocaleString()}</p>
                          <p>Page: {item.context.url}</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
