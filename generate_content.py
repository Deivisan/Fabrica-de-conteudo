#!/usr/bin/env python3
"""
🏭 FÁBRICA DE CONTEÚDO - GERADOR AUTOMATIZADO
=============================================
Sistema para gerar conteúdo B2B usando prompts estruturados em JSON.

Uso:
    python generate_content.py --prompt A2-pagina-produtos
    python generate_content.py --all-images
    python generate_content.py --all-audio
    python generate_content.py --status
"""

import json
import os
import sys
import argparse
from datetime import datetime
from pathlib import Path

# Configurações
BASE_DIR = Path("clients/Thamires")
PROMPTS_NANO_DIR = BASE_DIR / "prompts" / "nanobanana"
PROMPTS_NOTEBOOK_DIR = BASE_DIR / "prompts" / "notebooklm"
OUTPUTS_IMAGES_DIR = BASE_DIR / "outputs" / "imagens"
OUTPUTS_AUDIO_DIR = BASE_DIR / "outputs" / "audios"

# Cores ANSI
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"
BOLD = "\033[1m"


def log(message: str, level: str = "INFO"):
    """Log colorido com timestamp."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    emoji = {
        "INFO": "ℹ️",
        "SUCCESS": "✅",
        "ERROR": "❌",
        "WARNING": "⚠️",
        "PROGRESS": "🔄",
    }.get(level, "📝")
    color = {"INFO": BLUE, "SUCCESS": GREEN, "ERROR": RED, "WARNING": YELLOW}.get(
        level, RESET
    )
    print(f"{color}[{timestamp}] {emoji} {message}{RESET}")


def load_prompt(prompt_id: str, category: str = "nanobanana") -> dict:
    """Carrega um prompt JSON pelo ID."""
    if category == "nanobanana":
        prompt_path = PROMPTS_NANO_DIR / f"{prompt_id}.json"
    else:
        prompt_path = PROMPTS_NOTEBOOK_DIR / f"{prompt_id}.json"

    if not prompt_path.exists():
        raise FileNotFoundError(f"Prompt não encontrado: {prompt_path}")

    with open(prompt_path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_prompt(prompt_data: dict, category: str = "nanobanana"):
    """Salva um prompt JSON atualizado."""
    prompt_id = prompt_data["promptId"]
    if category == "nanobanana":
        prompt_path = PROMPTS_NANO_DIR / f"{prompt_id}.json"
    else:
        prompt_path = PROMPTS_NOTEBOOK_DIR / f"{prompt_id}.json"

    with open(prompt_path, "w", encoding="utf-8") as f:
        json.dump(prompt_data, f, ensure_ascii=False, indent=2)


def mark_prompt_used(prompt_id: str, output_file: str, category: str = "nanobanana"):
    """Marca um prompt como usado e atualiza metadados."""
    prompt_data = load_prompt(prompt_id, category)

    prompt_data["metadadosGerados"]["promptUsado"] = True
    prompt_data["metadadosGerados"]["dataGeracao"] = datetime.now().strftime("%Y-%m-%d")
    prompt_data["metadadosGerados"]["arquivoResultado"] = output_file
    prompt_data["metadadosGerados"]["verificacao"]["status"] = "pendente"

    # Adicionar ao histórico
    if "historico" not in prompt_data:
        prompt_data["historico"] = {"criacao": "2026-01-21", "atualizacoes": []}

    prompt_data["historico"]["atualizacoes"].append(
        {
            "data": datetime.now().strftime("%Y-%m-%d"),
            "acao": "prompt_usado",
            "arquivoGerado": output_file,
        }
    )

    save_prompt(prompt_data, category)
    log(f"Prompt {prompt_id} marcado como usado", "SUCCESS")


def get_status(category: str = "all") -> dict:
    """Retorna status de todos os prompts."""
    status = {
        "images": {"total": 0, "used": 0, "pending": 0},
        "audio": {"total": 0, "used": 0, "pending": 0},
    }

    if category in ["all", "images"]:
        for f in PROMPTS_NANO_DIR.glob("*.json"):
            prompt = load_prompt(f.stem, "nanobanana")
            status["images"]["total"] += 1
            if prompt["metadadosGerados"]["promptUsado"]:
                status["images"]["used"] += 1
            else:
                status["images"]["pending"] += 1

    if category in ["all", "audio"]:
        for f in PROMPTS_NOTEBOOK_DIR.glob("*.json"):
            prompt = load_prompt(f.stem, "notebooklm")
            status["audio"]["total"] += 1
            if prompt["metadadosGerados"]["promptUsado"]:
                status["audio"]["used"] += 1
            else:
                status["audio"]["pending"] += 1

    return status


def print_status():
    """Imprime status formatado."""
    status = get_status()

    print(f"\n{BOLD}📊 STATUS DA FÁBRICA DE CONTEÚDO{RESET}")
    print("=" * 50)

    # Imagens
    print(f"\n{BLUE}🖼️  IMAGENS (Nano Banana Pro){RESET}")
    bar = "█" * status["images"]["used"] + "░" * status["images"]["pending"]
    print(f"   [{bar}] {status['images']['used']}/{status['images']['total']}")
    if status["images"]["pending"] > 0:
        print(f"   {YELLOW}⏳ Pendentes: {status['images']['pending']}{RESET}")

    # Áudio
    print(f"\n{BLUE}🎙️  ÁUDIOS (NotebookLM){RESET}")
    bar = "█" * status["audio"]["used"] + "░" * status["audio"]["pending"]
    print(f"   [{bar}] {status['audio']['used']}/{status['audio']['total']}")
    if status["audio"]["pending"] > 0:
        print(f"   {YELLOW}⏳ Pendentes: {status['audio']['pending']}{RESET}")

    print(
        f"\n{GREEN}📈 Progresso Total: {(status['images']['used'] + status['audio']['used'])}/{(status['images']['total'] + status['audio']['total'])} prompts executados{RESET}"
    )


def list_pending(category: str = "all"):
    """Lista prompts pendentes."""
    print(f"\n{BOLD}📋 PROMPTS PENDENTES{RESET}\n")

    if category in ["all", "images"]:
        print(f"{YELLOW}🖼️  IMAGENS:{RESET}")
        for f in sorted(PROMPTS_NANO_DIR.glob("*.json")):
            prompt = load_prompt(f.stem, "nanobanana")
            if not prompt["metadadosGerados"]["promptUsado"]:
                print(f"   • {BOLD}{prompt['promptId']}{RESET} - {prompt['titulo']}")

    if category in ["all", "audio"]:
        print(f"\n{YELLOW}🎙️  ÁUDIOS:{RESET}")
        for f in sorted(PROMPTS_NOTEBOOK_DIR.glob("*.json")):
            prompt = load_prompt(f.stem, "notebooklm")
            if not prompt["metadadosGerados"]["promptUsado"]:
                print(f"   • {BOLD}{prompt['promptId']}{RESET} - {prompt['titulo']}")


def extract_prompt_text(prompt_id: str, category: str = "nanobanana") -> str:
    """Extrai apenas o texto do prompt para uso na ferramenta."""
    prompt_data = load_prompt(prompt_id, category)
    return prompt_data["promptCompleto"]


def generate_image(prompt_id: str):
    """
    Gera uma imagem usando o prompt estruturado.

    NOTA: Esta função precisa ser implementada com a API real.
    Atualmente suporta:
    - Google Gemini API (gemini-2.0-flash-exp)
    - Nano Banana Pro (quando disponível)
    """
    prompt_data = load_prompt(prompt_id, "nanobanana")

    print(f"\n{BOLD}🖼️  GERANDO IMAGEM: {prompt_id}{RESET}")
    print(f"   Título: {prompt_data['titulo']}")
    print(f"   Dimensões: {prompt_data['parametros']['dimensoes']}")
    print(f"   Ferramenta: {prompt_data['parametros']['ferramenta']}")
    print()

    # Extrair prompt completo
    prompt_text = prompt_data["promptCompleto"]
    print(f"{BLUE}📝 Prompt Extraído:{RESET}")
    print("-" * 60)
    print(prompt_text[:200] + "..." if len(prompt_text) > 200 else prompt_text)
    print("-" * 60)
    print()

    # TODO: Implementar geração real quando API estiver disponível
    log(f"Para gerar esta imagem, use:", "INFO")
    print(f"   1. Acesse: Nano Banana Pro (Gemini 2.5 Flash Image)")
    print(f"   2. Cole o prompt completo")
    print(f"   3. Configure dimensões: {prompt_data['parametros']['dimensoes']}")
    print(f"   4. Baixe o resultado para: outputs/imagens/")
    print(
        f"   5. Execute: python generate_content.py --mark-used {prompt_id} <arquivo>"
    )

    return prompt_text


def generate_audio(prompt_id: str):
    """Gera um áudio usando o prompt estruturado."""
    prompt_data = load_prompt(prompt_id, "notebooklm")

    print(f"\n{BOLD}🎙️  GERANDO ÁUDIO: {prompt_id}{RESET}")
    print(f"   Título: {prompt_data['titulo']}")
    print(f"   Duração: {prompt_data['parametros']['duracao']}")
    print(f"   Ferramenta: {prompt_data['parametros']['ferramenta']}")
    print()

    # Extrair prompt completo
    prompt_text = prompt_data["promptCompleto"]
    print(f"{BLUE}📝 Prompt Extraído:{RESET}")
    print("-" * 60)
    print(prompt_text[:300] + "..." if len(prompt_text) > 300 else prompt_text)
    print("-" * 60)
    print()

    log(f"Para gerar este áudio, use:", "INFO")
    print(f"   1. Acesse: notebooklm.google.com")
    print(f"   2. Crie ou abra um projeto")
    print(f"   3. Cole o prompt no Audio Overview")
    print(f"   4. Configure: 2 vozes, {prompt_data['parametros']['duracao']}")
    print(f"   5. Baixe o resultado para: outputs/audios/")
    print(
        f"   6. Execute: python generate_content.py --mark-used {prompt_id} <arquivo>"
    )

    return prompt_text


def main():
    parser = argparse.ArgumentParser(
        description="🏭 Fábrica de Conteúdo - Gerador Automatizado",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
    python generate_content.py --status              # Ver status
    python generate_content.py --pending             # Listar pendentes
    python generate_content.py --extract A2-pagina-produtos  # Extrair prompt
    python generate_content.py --image A2-pagina-produtos    # Preparar geração
    python generate_content.py --audio A1-onboarding          # Preparar áudio
    python generate_content.py --mark-used A2-pagina-produtos outputs/imagens/A2.png  # Marcar usado
        """,
    )

    parser.add_argument("--status", action="store_true", help="Mostrar status geral")
    parser.add_argument(
        "--pending", action="store_true", help="Listar prompts pendentes"
    )
    parser.add_argument("--extract", metavar="ID", help="Extrair texto do prompt")
    parser.add_argument("--image", metavar="ID", help="Preparar geração de imagem")
    parser.add_argument("--audio", metavar="ID", help="Preparar geração de áudio")
    parser.add_argument(
        "--mark-used",
        nargs=2,
        metavar=("ID", "ARQUIVO"),
        help="Marcar prompt como usado",
    )
    parser.add_argument(
        "--all-images", action="store_true", help="Listar todos os prompts de imagem"
    )
    parser.add_argument(
        "--all-audio", action="store_true", help="Listar todos os prompts de áudio"
    )

    args = parser.parse_args()

    if not any(
        [
            args.status,
            args.pending,
            args.extract,
            args.image,
            args.audio,
            args.mark_used,
            args.all_images,
            args.all_audio,
        ]
    ):
        parser.print_help()
        print(f"\n{BOLD}📋 OPÇÕES DISPONÍVEIS:{RESET}")
        print("   --status       Ver status geral")
        print("   --pending      Listar prompts pendentes")
        print("   --extract ID   Extrair texto do prompt")
        print("   --image ID     Preparar geração de imagem")
        print("   --audio ID     Preparar geração de áudio")
        print("   --mark-used ID ARQUIVO  Marcar prompt como usado")
        print("   --all-images   Listar todos os prompts de imagem")
        print("   --all-audio    Listar todos os prompts de áudio")
        return

    if args.status:
        print_status()

    if args.pending:
        list_pending("all")

    if args.all_images:
        list_pending("images")

    if args.all_audio:
        list_pending("audio")

    if args.extract:
        try:
            prompt = extract_prompt_text(args.extract, "nanobanana")
            print(f"\n{BOLD}📝 Prompt Extraído: {args.extract}{RESET}\n")
            print(prompt)
            print()
        except FileNotFoundError:
            try:
                prompt = extract_prompt_text(args.extract, "notebooklm")
                print(f"\n{BOLD}📝 Prompt Extraído: {args.extract}{RESET}\n")
                print(prompt)
                print()
            except FileNotFoundError:
                log(f"Prompt não encontrado: {args.extract}", "ERROR")

    if args.image:
        generate_image(args.image)

    if args.audio:
        generate_audio(args.audio)

    if args.mark_used:
        prompt_id, output_file = args.mark_used
        try:
            mark_prompt_used(prompt_id, output_file, "nanobanana")
            log(
                f"Prompt {prompt_id} marcado como usado com arquivo {output_file}",
                "SUCCESS",
            )
        except FileNotFoundError:
            try:
                mark_prompt_used(prompt_id, output_file, "notebooklm")
                log(
                    f"Prompt {prompt_id} marcado como usado com arquivo {output_file}",
                    "SUCCESS",
                )
            except FileNotFoundError:
                log(f"Prompt não encontrado: {prompt_id}", "ERROR")


if __name__ == "__main__":
    main()
