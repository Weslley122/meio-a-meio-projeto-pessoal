package com.meioameio.backend;

import com.meioameio.backend.model.Produto;
import com.meioameio.backend.model.Usuario;
import com.meioameio.backend.repository.ProdutoRepository;
import com.meioameio.backend.repository.UsuarioRepository;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

// O login é feito pelo nosso JWT; desliga o usuário/senha padrão que o Spring Security criaria sozinho.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class MeioAMeioBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeioAMeioBackendApplication.class, args);
    }

    /**
     * Popula o banco com o usuário admin e o catálogo de produtos na primeira execução.
     * Login do admin (painel do Carlinho): telefone 99999999999 e a senha de ADMIN_SENHA.
     * Sem a variável, em desenvolvimento a senha é admin123; no perfil "prod" a variável é obrigatória.
     */
    @Bean
    CommandLineRunner seedDados(UsuarioRepository usuarioRepository,
                                ProdutoRepository produtoRepository,
                                PasswordEncoder passwordEncoder,
                                @Value("${app.admin.senha}") String senhaAdmin) {
        return args -> {
            if ("admin123".equals(senhaAdmin)) {
                LoggerFactory.getLogger("SEGURANCA").warn(
                        "evento=senha_padrao_admin aviso=\"senha de desenvolvimento em uso; defina ADMIN_SENHA fora da sua máquina\"");
            }
            if (usuarioRepository.findByTelefone("99999999999").isEmpty()) {
                Usuario admin = new Usuario();
                admin.setNome("Carlinho (Admin)");
                admin.setTelefone("99999999999");
                admin.setEndereco("Meio a Meio do Carlinho");
                admin.setSenha(passwordEncoder.encode(senhaAdmin));
                admin.setRole("ADMIN");
                usuarioRepository.save(admin);
            }

            if (produtoRepository.count() == 0) {
                produtoRepository.saveAll(java.util.List.of(
                        new Produto(1L, "cervejas", "Cerveja Pilsen Lata 350ml", "Bem geladinha", new BigDecimal("4.50"), "can", "#E7A83C", "#4A2E14"),
                        new Produto(2L, "cervejas", "Cerveja Puro Malte Long Neck", "Garrafa 355ml", new BigDecimal("7.90"), "bottle", "#6B4423", "#F2EAD8"),
                        new Produto(3L, "cervejas", "Pack Pilsen c/ 12 latas", "Fechadinho", new BigDecimal("48.00"), "can", "#E7A83C", "#8B1E1E"),
                        new Produto(4L, "cervejas", "Cerveja Escura Lata 350ml", "Sabor encorpado", new BigDecimal("6.20"), "can", "#3D2415", "#141414"),
                        new Produto(5L, "refrigerantes", "Refrigerante Cola 2L", "Garrafa gelada", new BigDecimal("9.90"), "bottle", "#241209", "#C0392B"),
                        new Produto(6L, "refrigerantes", "Refrigerante Guaraná 2L", "Garrafa gelada", new BigDecimal("8.90"), "bottle", "#C7CE5A", "#4C7A3D"),
                        new Produto(7L, "refrigerantes", "Refrigerante Laranja 2L", "Garrafa gelada", new BigDecimal("8.50"), "bottle", "#F2924A", "#D9600D"),
                        new Produto(8L, "refrigerantes", "Refrigerante Lata 350ml", "Individual", new BigDecimal("4.00"), "can", "#D6D6D6", "#C0392B"),
                        new Produto(9L, "aguas", "Água Mineral sem Gás 500ml", "", new BigDecimal("2.50"), "bottle-small", "#DCEEF5", "#3E8FB0"),
                        new Produto(10L, "aguas", "Água Mineral com Gás 500ml", "", new BigDecimal("3.00"), "bottle-small", "#DCEEF5", "#2A9D8F"),
                        new Produto(11L, "aguas", "Suco de Caju 1L", "Polpa natural", new BigDecimal("7.50"), "bottle", "#E0663D", "#F5EBDD"),
                        new Produto(12L, "aguas", "Água de Coco 1L", "Bem gelada", new BigDecimal("8.00"), "bottle", "#EAF2E3", "#6B9E5E"),
                        new Produto(13L, "gelo", "Gelo em Cubos 5kg", "Saco reforçado", new BigDecimal("10.00"), "ice", null, null),
                        new Produto(14L, "gelo", "Gelo em Barra", "Unidade", new BigDecimal("4.00"), "icebar", null, null),
                        new Produto(15L, "snacks", "Batata Chips 100g", "", new BigDecimal("8.90"), "bag", "#EFB93E", null),
                        new Produto(16L, "snacks", "Amendoim Torrado 200g", "", new BigDecimal("6.50"), "bag", "#C9A063", null),
                        new Produto(17L, "snacks", "Biscoito Recheado 130g", "", new BigDecimal("4.20"), "bag", "#8B5A3C", null),
                        new Produto(18L, "mercearia", "Carvão para Churrasco 3kg", "", new BigDecimal("14.90"), "bag", "#2B2B2B", null),
                        new Produto(19L, "mercearia", "Copo Descartável 300ml", "Pacote c/ 25", new BigDecimal("6.00"), "cups", null, null),
                        new Produto(20L, "mercearia", "Combo Gelo + Refri", "5kg de gelo + cola 2L", new BigDecimal("18.90"), "bag", "#F2924A", null),
                        new Produto(21L, "enlatados", "Sardinha em Lata 125g", "Pronta pra comer", new BigDecimal("5.90"), "tin", "#3E6B99", null),
                        new Produto(22L, "enlatados", "Milho Verde em Lata 200g", "", new BigDecimal("4.50"), "tin", "#E8C547", null),
                        new Produto(23L, "enlatados", "Ervilha em Lata 200g", "", new BigDecimal("4.50"), "tin", "#6B9E5E", null),
                        new Produto(24L, "enlatados", "Extrato de Tomate 340g", "", new BigDecimal("5.20"), "tin", "#C0392B", null),
                        new Produto(25L, "enlatados", "Feijão Carioca em Lata 220g", "", new BigDecimal("6.00"), "tin", "#A9744F", null),
                        new Produto(26L, "carnes", "Linguiça Toscana 500g", "Resfriada", new BigDecimal("16.90"), "tray", "#A85838", null),
                        new Produto(27L, "carnes", "Frango Resfriado (kg)", "", new BigDecimal("14.90"), "tray", "#F0C9B8", null),
                        new Produto(28L, "carnes", "Carne Moída (kg)", "", new BigDecimal("28.90"), "tray", "#9E3B3B", null),
                        new Produto(29L, "carnes", "Presunto Fatiado 200g", "", new BigDecimal("8.90"), "tray", "#E8A5A0", null),
                        new Produto(30L, "carnes", "Queijo Mussarela Fatiado 200g", "", new BigDecimal("11.90"), "tray", "#F2E4A8", null)
                ));
            }
        };
    }
}
