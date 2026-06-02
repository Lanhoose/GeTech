<?php
require_once 'conexao.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $perfil = $_POST['tipo_usuario'];
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $doc = $_POST['doc'];
    $tel = $_POST['tel'];
    $setor = $_POST['setor'];
    $senha = $_POST['senha'];
    $senha2 = $_POST['senha2'];

    if ($senha !== $senha2) {
        echo "<script>alert('As senhas não conferem!'); window.history.back();</script>";
        exit;
    }

    // Hash de senha seguro para o banco de dados
    $senha_criptografada = password_hash($senha, PASSWORD_DEFAULT);

    try {
        $sql = "INSERT INTO usuarios (nome, email, documento, telefone, setor, perfil, senha) 
                VALUES (:nome, :email, :doc, :tel, :setor, :perfil, :senha)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nome' => $nome,
            ':email' => $email,
            ':doc' => $doc,
            ':tel' => $tel,
            ':setor' => $setor,
            ':perfil' => $perfil,
            ':senha' => $senha_criptografada
        ]);

        echo "<script>alert('Cadastro realizado com sucesso!'); window.location.href = 'login.html';</script>";
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Código para registro duplicado (E-mail)
            echo "<script>alert('Este e-mail já está cadastrado!'); window.history.back();</script>";
        } else {
            echo "Erro ao cadastrar: " . $e->getMessage();
        }
    }
}
?>