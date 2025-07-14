import Navbar from "@/components/shared/navbar";
import { Sparkles, Settings, Shield } from "lucide-react";

function FeatureCard({ title, description, icon }) {
  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

export default function welcome_standart() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex flex-col items-center justify-center flex-grow px-4 py-12">
        <div className="max-w-3xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to CookieCMS
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300">
            Modern technology and design for creating a minecraft project
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <FeatureCard 
              title="Easy to Use"
              description="Intuitive interface that gets you up and running in minutes"
              icon={<Sparkles className="w-6 h-6" />}
            />
            <FeatureCard
              title="Flexible"
              description="Customize your website exactly how you want with powerful customization tools"
              icon={<Settings className="w-6 h-6" />}
            />
            <FeatureCard
              title="Secure"
              description="Advanced security measures to protect your content and data"
              icon={<Shield className="w-6 h-6" />}
            />
          </div>

          <div className="mt-12 space-x-4">
            {/* 
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Get Started
            </button>
            <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Learn More
            </button> 
            */}
          </div>
        </div>
      </main>
    </div>
  );
}