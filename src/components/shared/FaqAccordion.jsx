import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

const FaqItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  const neonColors = [
    'rgba(239, 68, 68, 0.35)', // red
    'rgba(59, 130, 246, 0.35)', // blue
    'rgba(16, 185, 129, 0.35)', // green
    'rgba(168, 85, 247, 0.35)', // purple
  ];
  
  const currentColor = neonColors[index % neonColors.length];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="rounded-2xl border bg-[#0e101a]/60 overflow-hidden transition-all duration-300"
      style={{ 
        borderColor: isOpen ? currentColor : 'rgba(255,255,255,0.05)',
        boxShadow: isOpen ? `0 0 25px ${currentColor}22` : 'none'
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left font-bold text-white text-sm cursor-pointer select-none"
      >
        <span>{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-500"
        >
          <FiChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 pt-1 text-xs text-gray-400 font-semibold leading-relaxed border-t border-gray-900/40">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const FaqAccordion = () => {
  const faqs = [
    {
      question: "What is FullMark Assessment Platform?",
      answer: "FullMark is a modern, unified learning management and exam scoring system designed for students, teachers, and admins. It provides role-specific dashboards to build question databases, schedule evaluations, take online quizzes, and view statistical analytics instantly."
    },
    {
      question: "How does the AI Question Parser work?",
      answer: "Teachers can upload educational syllabus files or worksheets in PDF format, and our intelligent parsing engine recognizes structures, questions, and option configurations automatically to construct digital mock questions without manual entry."
    },
    {
      question: "Are exam results graded in real-time?",
      answer: "Yes, students receive automated scores and evaluation metrics immediately upon submitting their online exam session. Detailed item analysis is stored and shared instantly with the subject's designated teacher."
    },
    {
      question: "Can I manage multiple student divisions and groups?",
      answer: "Absolutely. System administrators can organize classrooms, customize subject associations, map specific access controls for tutors, and oversee school-wide reports from a single pane of glass."
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3.5 px-4">
      {faqs.map((faq, i) => (
        <FaqItem key={i} question={faq.question} answer={faq.answer} index={i} />
      ))}
    </div>
  );
};
