
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, LayoutGrid, Users } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-secondary/30 pt-24 pb-20">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col items-center text-center animate-fade-in">
            <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-secondary rounded-full text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>Project Management Reimagined</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-6 max-w-4xl">
              Simple, beautiful project management for marketing teams
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Streamline your workflow with an intuitive Kanban board and powerful project analytics, all in one elegant interface.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                onClick={() => navigate("/dashboard")}
                className="btn-primary px-6 py-3 flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              
              <button className="btn-secondary px-6 py-3">
                <span>Learn More</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl font-medium mb-4">Designed for clarity and focus</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with the principles of simplicity and elegance to enhance your team's productivity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<LayoutGrid className="h-6 w-6" />}
              title="Intuitive Kanban Board"
              description="Visualize your workflow with our elegant drag-and-drop Kanban board, designed for clarity and ease of use."
              delay={0}
            />
            
            <FeatureCard 
              icon={<CheckCircle className="h-6 w-6" />}
              title="Project Analytics"
              description="Get insights into your team's performance with beautiful, minimalist dashboards and progress tracking."
              delay={100}
            />
            
            <FeatureCard 
              icon={<Users className="h-6 w-6" />}
              title="Team Collaboration"
              description="Effortlessly assign tasks, share updates, and collaborate with your team in real-time."
              delay={200}
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container px-6 mx-auto">
          <div className="glass-card rounded-xl p-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-medium mb-4">Ready to transform your workflow?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Sign up now and experience the elegance of thoughtful project management.
            </p>
            
            <button 
              onClick={() => navigate("/dashboard")}
              className="btn-primary px-6 py-3"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 bg-white">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="font-semibold text-lg">Flowspace</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2023 Flowspace. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <div 
      className="glass-card rounded-xl p-6 card-hover animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
