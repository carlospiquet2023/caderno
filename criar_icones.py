#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para criar ícones PNG para o Caderno Digital com IA
Cria ícones simples usando PIL/Pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    print("✅ Pillow instalado!")
except ImportError:
    print("❌ Pillow não encontrado. Instalando...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image, ImageDraw, ImageFont
    print("✅ Pillow instalado com sucesso!")

def criar_icone(tamanho, nome_arquivo):
    """Cria um ícone PNG com design do caderno"""
    
    # Criar imagem com fundo índigo
    img = Image.new('RGB', (tamanho, tamanho), color='#4f46e5')
    draw = ImageDraw.Draw(img)
    
    # Adicionar borda arredondada (simulação com retângulo menor)
    margem = tamanho // 10
    cor_papel = '#fffde7'
    
    # Desenhar "papel" do caderno
    draw.rectangle(
        [margem, margem, tamanho - margem, tamanho - margem],
        fill=cor_papel
    )
    
    # Linha vertical vermelha (margem do caderno)
    linha_x = margem + (tamanho // 6)
    draw.line(
        [(linha_x, margem), (linha_x, tamanho - margem)],
        fill='#f87171',
        width=max(2, tamanho // 96)
    )
    
    # Linhas horizontais azuis (pautas)
    num_linhas = 6
    espaco = (tamanho - 2 * margem) // (num_linhas + 1)
    for i in range(1, num_linhas + 1):
        y = margem + (i * espaco)
        draw.line(
            [(margem, y), (tamanho - margem, y)],
            fill='#a5b4fc',
            width=max(1, tamanho // 192)
        )
    
    # Adicionar símbolo de IA (losango + círculo)
    centro_x = tamanho // 2
    centro_y = tamanho // 2
    raio = tamanho // 8
    
    # Losango
    pontos = [
        (centro_x, centro_y - raio),  # topo
        (centro_x + raio, centro_y),   # direita
        (centro_x, centro_y + raio),   # baixo
        (centro_x - raio, centro_y)    # esquerda
    ]
    draw.polygon(pontos, fill='#4f46e5', outline='#4f46e5')
    
    # Círculo branco no centro
    raio_circulo = raio // 2
    draw.ellipse(
        [centro_x - raio_circulo, centro_y - raio_circulo,
         centro_x + raio_circulo, centro_y + raio_circulo],
        fill='white'
    )
    
    # Salvar
    img.save(nome_arquivo, 'PNG')
    print(f"✅ {nome_arquivo} criado ({tamanho}x{tamanho}px)")
    
    return img

def criar_favicon():
    """Cria favicon.ico de 32x32"""
    img = criar_icone(32, 'temp_32.png')
    img.save('favicon.ico', format='ICO', sizes=[(32, 32)])
    print("✅ favicon.ico criado (32x32px)")
    
    # Limpar temporário
    import os
    os.remove('temp_32.png')

def criar_apple_icon():
    """Cria apple-touch-icon.png de 180x180"""
    criar_icone(180, 'apple-touch-icon.png')

if __name__ == '__main__':
    print("="*50)
    print("  CRIANDO ÍCONES PNG")
    print("  Caderno Digital com IA")
    print("="*50)
    print()
    
    # Criar ícones
    criar_icone(192, 'icon-192.png')
    criar_icone(512, 'icon-512.png')
    criar_favicon()
    criar_apple_icon()
    
    print()
    print("="*50)
    print("  ✅ ÍCONES CRIADOS COM SUCESSO!")
    print("="*50)
    print()
    print("📦 Arquivos criados:")
    print("   - icon-192.png")
    print("   - icon-512.png")
    print("   - favicon.ico")
    print("   - apple-touch-icon.png")
    print()
    print("📝 Próximos passos:")
    print("   1. Atualizar manifest.json (trocar .svg por .png)")
    print("   2. Adicionar favicon no index.html")
    print()
