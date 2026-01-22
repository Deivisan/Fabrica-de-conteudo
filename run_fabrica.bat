@echo off
REM ================================================
REM 🏭 FÁBRICA DE CONTEÚDO - SCRIPT DE EXECUÇÃO
REM ================================================

echo.
echo ============================================
echo    🏭 FÁBRICA DE CONTEÚDO - EXECUTAR
echo ============================================
echo.
echo  OPÇÕES:
echo  -------------------------------------------
echo  [1] Ver status geral
echo  [2] Listar prompts pendentes
echo  [3] Extrair prompt (digite o ID)
echo  [4] Preparar geração de imagem
echo  [5] Preparar geração de áudio
echo  [6] Marcar prompt como usado
echo  [7] Gerar PRÓXIMO prompt pendente
echo  [0] Sair
echo  -------------------------------------------
echo.

set /p choice="Escolha uma opção: "

if "%choice%"=="1" goto status
if "%choice%"=="2" goto pending
if "%choice%"=="3" goto extract
if "%choice%"=="4" goto image
if "%choice%"=="5" goto audio
if "%choice%"=="6" goto mark
if "%choice%"=="7" goto next
if "%choice%"=="0" goto exit

echo Opção inválida!
goto menu

:status
    python "%~dp0generate_content.py" --status
    pause
    goto menu

:pending
    python "%~dp0generate_content.py" --pending
    pause
    goto menu

:extract
    set /p pid="Digite o ID do prompt (ex: A2-pagina-produtos): "
    python "%~dp0generate_content.py" --extract %pid%
    pause
    goto menu

:image
    set /p pid="Digite o ID da imagem (ex: A2-pagina-produtos): "
    python "%~dp0generate_content.py" --image %pid%
    pause
    goto menu

:audio
    set /p pid="Digite o ID do áudio (ex: A1-onboarding-revendedor): "
    python "%~dp0generate_content.py" --audio %pid%
    pause
    goto menu

:mark
    set /p pid="Digite o ID do prompt: "
    set /p file="Digite o caminho do arquivo gerado: "
    python "%~dp0generate_content.py" --mark-used %pid% "%file%"
    pause
    goto menu

:next
    echo.
    echo 🔄 Executando próximo prompt pendente...
    python "%~dp0generate_content.py" --pending
    echo.
    set /p pid="Digite qual prompt executar: "
    python "%~dp0generate_content.py" --image %pid%
    pause
    goto menu

:exit
    echo.
    echo 👋 Saindo...
    echo.

:end
