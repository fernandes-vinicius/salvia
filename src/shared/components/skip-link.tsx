// Primeiro item focável da página: quem navega por teclado ou leitor de tela
// pula o cabeçalho e vai direto ao conteúdo (`#conteudo`).
export function SkipLink() {
	return (
		<a
			href="#conteudo"
			className="sr-only rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground text-sm outline-none focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:ring-[3px] focus-visible:ring-ring/50"
		>
			Pular para o conteúdo
		</a>
	);
}
