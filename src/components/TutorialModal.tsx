
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  image?: string;
}

export function TutorialModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      title: "Bem-vindo ao Gerenciador de Projetos",
      description: "Este é um breve tutorial para ajudá-lo a começar. Você pode pular a qualquer momento."
    },
    {
      title: "Crie seu primeiro projeto",
      description: "Clique no botão 'Novo Projeto' para criar seu primeiro projeto. Dê um nome e uma descrição para ele."
    },
    {
      title: "Gerencie tarefas no quadro Kanban",
      description: "Clique em um projeto para acessar o quadro Kanban. Arraste e solte tarefas entre as colunas para atualizar seu status."
    },
    {
      title: "Adicione anotações às tarefas",
      description: "Clique no ícone de lápis em qualquer tarefa para adicionar anotações pessoais e lembretes."
    },
    {
      title: "Pronto para começar!",
      description: "Você está pronto para usar o gerenciador de projetos. Boa sorte com seus projetos!"
    }
  ];

  useEffect(() => {
    // Verifica se o tutorial já foi visto
    const tutorialShown = localStorage.getItem('tutorialShown');
    if (!tutorialShown) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSkip();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tutorialShown', 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tutorialSteps[currentStep].title}</DialogTitle>
          <DialogDescription>
            {tutorialSteps[currentStep].description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center py-4">
          {/* Indicadores de passo */}
          <div className="flex gap-2">
            {tutorialSteps.map((_, index) => (
              <div 
                key={index} 
                className={`h-2 w-2 rounded-full ${index === currentStep ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={handleSkip}>
            Pular tutorial
          </Button>
          <Button onClick={handleNext} className="gap-2">
            {currentStep < tutorialSteps.length - 1 ? (
              <>
                Próximo
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Concluir
                <Check className="h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
