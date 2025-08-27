export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <h1 className="text-brand-indigo">Welcome to Best Adulting</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your household management companion. Track assets, manage tasks, and keep your home organized with ease.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto mt-8">
            <div className="h-16 bg-brand-lavender rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-brand-indigo">Lavender</span>
            </div>
            <div className="h-16 bg-brand-aqua rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-brand-indigo">Aqua</span>
            </div>
            <div className="h-16 bg-brand-lime rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-brand-indigo">Lime</span>
            </div>
            <div className="h-16 bg-brand-lemon rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-brand-indigo">Lemon</span>
            </div>
            <div className="h-16 bg-brand-mustard rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-white">Mustard</span>
            </div>
            <div className="h-16 bg-brand-peach rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-brand-indigo">Peach</span>
            </div>
            <div className="h-16 bg-brand-indigo rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-white">Indigo</span>
            </div>
            <div className="h-16 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">Neutral</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
