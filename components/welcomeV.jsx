import React from 'react';
import { Sparkles, Settings, Shield, ArrowRight, Zap, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from './shared/navbar';

function FeatureCard({ title, description, icon, gradient }) {
  return (
    <Card className="group relative overflow-hidden border-0 from-white/50 to-white/20 dark:from-gray-900/50 dark:to-gray-800/20 backdrop-blur-sm hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/10 transition-all duration-500 hover:-translate-y-2">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background: gradient}} />
      <CardHeader className="relative z-10 text-center pb-2">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-700 to-black dark:from-gray-300 dark:to-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          {React.cloneElement(icon, { className: "w-8 h-8 text-white dark:text-black" })}
        </div>
        <CardTitle className="text-xl font-bold group-hover:text-white transition-colors duration-300">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 text-center">
        <CardDescription className="text-gray-600 dark:text-gray-300 group-hover:text-white/90 transition-colors duration-300">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function FloatingIcon({ icon, className, delay = 0 }) {
  return (
    <div 
      className={`absolute opacity-20 animate-bounce ${className}`}
      style={{ animationDelay: `${delay}s`, animationDuration: '3s' }}
    >
      {React.cloneElement(icon, { className: "w-8 h-8 text-black dark:text-white" })}
    </div>
  );
}

export default function WelcomeStandard() {
  return (
    <div className="min-h-screen from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-gray-800 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      {/* <FloatingIcon icon={<Sparkles />} className="top-20 left-10" delay={0} />
      <FloatingIcon icon={<Settings />} className="top-40 right-20" delay={1} />
      <FloatingIcon icon={<Shield />} className="bottom-32 left-20" delay={2} />
      <FloatingIcon icon={<Zap />} className="top-32 right-10" delay={0.5} />
      <FloatingIcon icon={<Globe />} className="bottom-20 right-32" delay={1.5} />
      <FloatingIcon icon={<Lock />} className="top-60 left-32" delay={2.5} /> */}
      
      <Navbar />
      
      <main className="flex flex-col items-center justify-center flex-grow px-4 py-12 relative z-10">
        <div className="max-w-6xl text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            <Badge variant="secondary" className="px-4 py-2 text-gray-700 dark:text-gray-300 border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              New in CookieCMS 2.0
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-gray-900 via-black to-gray-800 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent leading-tight animate-pulse">
              Welcome to
              <br />
              <span className="relative">
                CookieCMS
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-600 to-black dark:from-gray-400 dark:to-white rounded-lg blur opacity-20 animate-pulse" />
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Modern technology and design for creating the ultimate 
              <span className="font-semibold text-black dark:text-white"> Minecraft project</span>
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <FeatureCard
              title="Lightning Fast"
              description="Intuitive interface that gets you up and running in minutes with blazing fast performance"
              icon={<Sparkles />}
              gradient="linear-gradient(135deg, #374151 0%, #111827 100%)"
            />
            <FeatureCard
              title="Infinitely Flexible"
              description="Customize your website exactly how you want with powerful customization tools and themes"
              icon={<Settings />}
              gradient="linear-gradient(135deg, #6b7280 0%, #374151 100%)"
            />
            <FeatureCard
              title="Fort Knox Secure"
              description="Advanced security measures and encryption to protect your content and user data"
              icon={<Shield />}
              gradient="linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
            />
          </div>

          {/* CTA Section */}
          <div className="mt-16 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="px-8 py-4 bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white hover:from-gray-900 hover:to-gray-800 dark:hover:from-gray-100 dark:hover:to-gray-200 text-white dark:text-black font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 border-2 border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
              >
                View Documentation
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No credit card required • Free forever • Premium support available
            </p>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">10k+</div>
              <div className="text-gray-600 dark:text-gray-400">Active Projects</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">99.9%</div>
              <div className="text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}