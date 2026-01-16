"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../auth.module.css";
import {
  Form,
  Input,
  InputGroup,
  Label,
  Radio,
  RadioGroup,
  TextField,
} from "@heroui/react";
import { Eye } from "@gravity-ui/icons";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "PATIENT",
    professionalLicense: "",
    specialty: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Crie sua conta</h1>
          <p className={styles.subtitle}>
            Preencha os dados abaixo para começar
          </p>
        </div>

        <Form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <Label className={styles.label}>Eu sou</Label>
            <RadioGroup
              defaultValue="PATIENT"
              name="role"
              value={formData.role}
              onChange={handleRoleChange}
              orientation="horizontal"
            >
              <Radio value="PATIENT">
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Radio.Content>
                  <Label className={styles.label}>Paciente</Label>
                </Radio.Content>
              </Radio>
              <Radio value="PROFESSIONAL">
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Radio.Content>
                  <Label className={styles.label}>Profissional</Label>
                </Radio.Content>
              </Radio>
            </RadioGroup>
          </div>

          <div className={styles.inputGroup}>
            <div className="flex flex-col gap-1">
              <Label htmlFor="name" className={styles.label}>
                Nome Completo
              </Label>
              <Input
                id="name"
                placeholder="Ex: Maria Silva"
                type="text"
                className={styles.input}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="input-type-email" className={styles.label}>
              Email
            </Label>
            <Input
              id="input-type-email"
              placeholder="jane@example.com"
              type="email"
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {formData.role === "PROFESSIONAL" && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="professionalLicense" className={styles.label}>
                  Registro Profissional (CRM/CRP)
                </label>
                <input
                  id="professionalLicense"
                  type="text"
                  placeholder="Ex: 123456-SP"
                  className={styles.input}
                  value={formData.professionalLicense}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="specialty" className={styles.label}>
                  Especialidade
                </label>
                <input
                  id="specialty"
                  type="text"
                  placeholder="Ex: Cardiologia"
                  className={styles.input}
                  value={formData.specialty}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <TextField fullWidth name="password">
              <Label>Senha</Label>
              <InputGroup fullWidth>
                <InputGroup.Input
                  placeholder="Insira a senha"
                  type="password"
                />
                <InputGroup.Suffix>
                  <Eye className="size-4 text-muted" />
                </InputGroup.Suffix>
              </InputGroup>
            </TextField>
            <TextField fullWidth name="confirmPassword">
              <Label>Confirmar a senha</Label>
              <InputGroup fullWidth>
                <InputGroup.Input
                  placeholder="Confirme a senha"
                  type="password"
                />
                <InputGroup.Suffix>
                  <Eye className="size-4 text-muted" />
                </InputGroup.Suffix>
              </InputGroup>
            </TextField>
          </div>

          <button type="submit" className={styles.button}>
            Cadastrar
          </button>
        </Form>

        <div className={styles.footer}>
          Já tem uma conta?
          <Link href="/auth/login" className={styles.link}>
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}
