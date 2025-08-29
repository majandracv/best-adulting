"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

interface FormFieldProps {
  label: string
  name: string
  error?: string
  required?: boolean
  className?: string
  children?: React.ReactNode
}

export function FormField({ label, name, error, required, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className={cn(error && "text-destructive")}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

interface ValidatedInputProps extends React.ComponentProps<typeof Input> {
  label: string
  error?: string
  onValueChange?: (value: string) => void
}

export function ValidatedInput({ label, error, onValueChange, className, required, ...props }: ValidatedInputProps) {
  return (
    <FormField label={label} name={props.name || ""} error={error} required={required}>
      <Input
        {...props}
        className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
        onChange={(e) => {
          props.onChange?.(e)
          onValueChange?.(e.target.value)
        }}
      />
    </FormField>
  )
}

interface ValidatedTextareaProps extends React.ComponentProps<typeof Textarea> {
  label: string
  error?: string
  onValueChange?: (value: string) => void
}

export function ValidatedTextarea({
  label,
  error,
  onValueChange,
  className,
  required,
  ...props
}: ValidatedTextareaProps) {
  return (
    <FormField label={label} name={props.name || ""} error={error} required={required}>
      <Textarea
        {...props}
        className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
        onChange={(e) => {
          props.onChange?.(e)
          onValueChange?.(e.target.value)
        }}
      />
    </FormField>
  )
}

interface ValidatedSelectProps {
  label: string
  name: string
  error?: string
  required?: boolean
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function ValidatedSelect({
  label,
  name,
  error,
  required,
  placeholder,
  value,
  onValueChange,
  children,
  className,
}: ValidatedSelectProps) {
  return (
    <FormField label={label} name={name} error={error} required={required} className={className}>
      <Select value={value} onValueChange={onValueChange} name={name}>
        <SelectTrigger className={cn(error && "border-destructive focus:ring-destructive")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FormField>
  )
}
