import { Category } from '@/types';

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id' | 'created_at'>[] = [
    { name: 'Alimentação', icon: 'utensils', color: '#F97316', type: 'expense', is_custom: false, is_active: true },
    { name: 'Transporte', icon: 'car', color: '#3B82F6', type: 'expense', is_custom: false, is_active: true },
    { name: 'Moradia', icon: 'home', color: '#0EA5E9', type: 'expense', is_custom: false, is_active: true },
    { name: 'Saúde', icon: 'heart-pulse', color: '#EF4444', type: 'expense', is_custom: false, is_active: true },
    { name: 'Educação', icon: 'graduation-cap', color: '#14B8A6', type: 'expense', is_custom: false, is_active: true },
    { name: 'Lazer', icon: 'gamepad-2', color: '#EC4899', type: 'expense', is_custom: false, is_active: true },
    { name: 'Compras', icon: 'shopping-bag', color: '#F59E0B', type: 'expense', is_custom: false, is_active: true },
    { name: 'Serviços', icon: 'wrench', color: '#475569', type: 'expense', is_custom: false, is_active: true },
    { name: 'Pets', icon: 'paw-print', color: '#84CC16', type: 'expense', is_custom: false, is_active: true },
    { name: 'Outros', icon: 'more-horizontal', color: '#64748B', type: 'expense', is_custom: false, is_active: true },
];

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id' | 'created_at'>[] = [
    { name: 'Salário', icon: 'banknote', color: '#22C55E', type: 'income', is_custom: false, is_active: true },
    { name: 'Freelance', icon: 'laptop', color: '#06B6D4', type: 'income', is_custom: false, is_active: true },
    { name: 'Investimentos', icon: 'trending-up', color: '#10B981', type: 'income', is_custom: false, is_active: true },
    { name: 'Presente', icon: 'gift', color: '#DB2777', type: 'income', is_custom: false, is_active: true },
    { name: 'Outros', icon: 'plus-circle', color: '#64748B', type: 'income', is_custom: false, is_active: true },
];

export const DEFAULT_CATEGORIES = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...DEFAULT_INCOME_CATEGORIES,
];

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Alimentação': ['mercado', 'supermercado', 'restaurante', 'lanche', 'ifood', 'uber eats', 'padaria', 'açougue', 'feira', 'pizza', 'hamburguer', 'almoço', 'jantar', 'café'],
    'Transporte': ['uber', '99', 'gasolina', 'combustível', 'estacionamento', 'metrô', 'ônibus', 'passagem', 'táxi', 'pedágio'],
    'Moradia': ['aluguel', 'condomínio', 'luz', 'água', 'gás', 'internet', 'iptu', 'energia', 'conta de luz'],
    'Saúde': ['farmácia', 'médico', 'consulta', 'exame', 'hospital', 'plano de saúde', 'remédio', 'dentista'],
    'Educação': ['curso', 'escola', 'faculdade', 'livro', 'mensalidade', 'material escolar', 'udemy', 'alura'],
    'Lazer': ['cinema', 'netflix', 'spotify', 'show', 'viagem', 'hotel', 'bar', 'festa', 'game', 'jogo'],
    'Compras': ['amazon', 'shopee', 'mercado livre', 'loja', 'magazine', 'shopping', 'roupa', 'calçado'],
    'Serviços': ['assinatura', 'celular', 'telefone', 'manutenção', 'conserto', 'serviço'],
    'Pets': ['pet', 'ração', 'veterinário', 'cachorro', 'gato', 'petshop'],
    'Salário': ['salário', 'pagamento', 'remuneração', 'adiantamento', 'férias', '13º', 'holerite'],
    'Freelance': ['freelance', 'projeto', 'consultoria', 'serviço prestado', 'freela'],
    'Investimentos': ['dividendo', 'rendimento', 'juros', 'ação', 'fundo', 'tesouro'],
};
