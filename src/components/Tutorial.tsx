
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Kanban, CheckSquare, ArrowRight, Check } from "lucide-react";

interface TutorialProps {
  onComplete: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Bem-vindo ao Flowspace",
      description: "Seu novo sistema de gerenciamento de projetos e tarefas. Vamos conhecer as principais funcionalidades.",
      icon: <LayoutDashboard className="h-12 w-12 text-primary" />
    },
    {
      title: "Painel Principal",
      description: "No painel, você pode visualizar todos os seus projetos, criar novos e acompanhar o progresso de cada um.",
      icon: <LayoutDashboard className="h-12 w-12 text-primary" />
    },
    {
      title: "Quadro Kanban",
      description: "Cada projeto tem um quadro Kanban, onde você pode organizar suas tarefas por status e acompanhar o fluxo de trabalho.",
      icon: <Kanban className="h-12 w-12 text-primary" />
    },
    {
      title: "Tarefas Pessoais",
      description: "Na seção 'Minhas Tarefas', você encontra todas as tarefas atribuídas a você em diferentes projetos.",
      icon: <CheckSquare className="h-12 w-12 text-primary" />
    },
    {
      title: "Anotações",
      description: "Cada tarefa possui um espaço para anotações, onde você pode adicionar informações detalhadas ou comentários.",
      icon: <Check className="h-12 w-12 text-primary" />
    }
  ];
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const skipTutorial = () => {
    onComplete();
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full animate-scale-in">
        <div className="p-6">
          <div className="flex justify-center mb-6">
            {steps[currentStep].icon}
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-4">
            {steps[currentStep].title}
          </h2>
          
          <p className="text-center text-muted-foreground mb-8">
            {steps[currentStep].description}
          </p>
          
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button 
              variant="outline" 
              onClick={skipTutorial}
              className="order-2 sm:order-1"
            >
              Pular Tutorial
            </Button>
            
            <Button 
              onClick={nextStep}
              className="order-1 sm:order-2 flex items-center gap-2"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                'Começar a usar'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
