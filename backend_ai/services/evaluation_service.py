"""
Evaluation Service for RAG system
Uses BERT Score and ROUGE metrics
"""
from bert_score import score as bert_score
from rouge_score import rouge_scorer
import logging
from typing import Dict, List, Any
import numpy as np

logger = logging.getLogger(__name__)

class EvaluationService:
    def __init__(self):
        self.rouge_scorer = rouge_scorer.RougeScorer(
            ['rouge1', 'rouge2', 'rougeL'],
            use_stemmer=True
        )
    
    def calculate_bert_score(
        self,
        predictions: List[str],
        references: List[str]
    ) -> Dict[str, float]:
        """
        Calculate BERT Score between predictions and references
        """
        try:
            P, R, F1 = bert_score(
                predictions,
                references,
                lang='en',
                verbose=False
            )
            
            return {
                "precision": float(P.mean()),
                "recall": float(R.mean()),
                "f1": float(F1.mean())
            }
        except Exception as e:
            logger.error(f"Error calculating BERT score: {e}")
            return {"precision": 0.0, "recall": 0.0, "f1": 0.0}
    
    def calculate_rouge_scores(
        self,
        prediction: str,
        reference: str
    ) -> Dict[str, Dict[str, float]]:
        """
        Calculate ROUGE scores
        """
        try:
            scores = self.rouge_scorer.score(reference, prediction)
            
            return {
                "rouge1": {
                    "precision": scores['rouge1'].precision,
                    "recall": scores['rouge1'].recall,
                    "f1": scores['rouge1'].fmeasure
                },
                "rouge2": {
                    "precision": scores['rouge2'].precision,
                    "recall": scores['rouge2'].recall,
                    "f1": scores['rouge2'].fmeasure
                },
                "rougeL": {
                    "precision": scores['rougeL'].precision,
                    "recall": scores['rougeL'].recall,
                    "f1": scores['rougeL'].fmeasure
                }
            }
        except Exception as e:
            logger.error(f"Error calculating ROUGE scores: {e}")
            return {}
    
    def calculate_retrieval_accuracy(
        self,
        retrieved_docs: List[Dict[str, Any]],
        relevant_doc_ids: List[str]
    ) -> float:
        """
        Calculate retrieval accuracy
        """
        try:
            if not relevant_doc_ids:
                return 0.0
            
            retrieved_ids = [
                doc.get("metadata", {}).get("doc_id", "")
                for doc in retrieved_docs
            ]
            
            relevant_retrieved = len(
                set(retrieved_ids) & set(relevant_doc_ids)
            )
            
            accuracy = relevant_retrieved / len(relevant_doc_ids)
            return accuracy
            
        except Exception as e:
            logger.error(f"Error calculating retrieval accuracy: {e}")
            return 0.0
    
    def evaluate_rag_response(
        self,
        prediction: str,
        reference: str,
        retrieved_docs: List[Dict[str, Any]],
        relevant_doc_ids: List[str] = None
    ) -> Dict[str, Any]:
        """
        Complete evaluation of RAG response
        """
        evaluation = {}
        
        # BERT Score
        bert_scores = self.calculate_bert_score([prediction], [reference])
        evaluation["bert_score"] = bert_scores
        
        # ROUGE Scores
        rouge_scores = self.calculate_rouge_scores(prediction, reference)
        evaluation["rouge_scores"] = rouge_scores
        
        # Retrieval Accuracy
        if relevant_doc_ids:
            retrieval_acc = self.calculate_retrieval_accuracy(
                retrieved_docs,
                relevant_doc_ids
            )
            evaluation["retrieval_accuracy"] = retrieval_acc
        
        return evaluation

# Global instance
evaluation_service = EvaluationService()
