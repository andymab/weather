<template>
  <v-dialog :model-value="modelValue" @update:model-value="onModelUpdate" max-width="640">
    <v-card>
      <v-card-title class="text-h6">Добавить пользователя</v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid" validate-on="submit">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model.trim="formData.name" label="Имя" :rules="[rules.required]" variant="outlined"
                density="comfortable" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model.trim="formData.email" label="Email" type="email" autocomplete="new-email"
                :rules="[rules.required, rules.email]" variant="outlined" density="comfortable" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model.trim="formData.password" label="Пароль" type="password" autocomplete="new-password"
                :rules="[rules.required, rules.min6]" variant="outlined" density="comfortable" />
            </v-col>

            <v-col cols="12" md="6">
              <v-select v-model="formData.role" :items="roles" item-title="name" item-value="name" label="Роль"
                :rules="[rules.required]" variant="outlined" density="comfortable" />
            </v-col>

            <!-- Необязательные поля — при необходимости можно убрать -->
            <v-col cols="12" md="6">
              <v-text-field v-model.trim="formData.phone" label="Телефон" variant="outlined" density="comfortable" />
            </v-col>

            <v-col cols="12" md="6">
              <!-- простой ввод даты без зависимостей -->
              <v-text-field v-model="formData.payment_time" label="Оплачено до" type="date" hint="Необязательно"
                persistent-hint variant="outlined" density="comfortable" />
            </v-col>

            <v-col cols="12">
              <v-switch v-model="formData.active" color="primary" inset :true-value="1" :false-value="0"
                label="Активен" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="onCancel" :disabled="loading">Отмена</v-btn>
        <v-btn color="primary" @click="onSave" :loading="loading">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from "@/Auth/api";

export default {
  name: "UserCreateDialog",
  props: {
    modelValue: { type: Boolean, default: false }, // v-model
    roles: { type: Array, default: () => [] }
  },
  emits: ["update:modelValue", "refresh", "close"],
  data() {
    return {
      valid: false,
      loading: false,
      formData: this.getEmptyForm(),
      rules: {
        required: v => (!!v || v === 0) || "Обязательное поле",
        email: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Некорректный email",
        min6: v => (v && v.length >= 6) || "Минимум 6 символов"
      }
    };
  },
  watch: {
    modelValue(val) {
      // при закрытии — чистим форму
      if (!val) this.resetForm();
    }
  },
  methods: {
    getEmptyForm() {
      return {
        name: "",
        email: "",
        password: "",
        role: null,
        phone: "",
        active: 1,
        payment_time: null
      };
    },
    onModelUpdate(v) {
      this.$emit("update:modelValue", v);
      if (!v) this.$emit("close");
    },
    async onSave() {
      const form = this.$refs.form;
      const { valid } = await form.validate();
      if (!valid) return;

      this.loading = true;
      try {
        const formData = new FormData();

        // Добавляем данные в FormData
        Object.keys(this.formData).forEach(key => {
          const value = this.formData[key];
          // Пустые строки не добавляем (или добавляем как undefined)
          if (value !== "") {
            formData.append(key, value);
          }
        });

        await api.updateUser(formData);

        this.$notify.success("Пользователь создан", 10000);
        this.$emit("refresh");
        this.closeDialog();
      } catch (e) {
        console.error(e);
        this.$notify.error("Ошибка при создании пользователя", 150000);
      } finally {
        this.loading = false;
      }
    },
    onCancel() {
      this.closeDialog();
    },
    closeDialog() {
      this.$emit("update:modelValue", false);
      this.$emit("close");
      this.resetForm();
    },
    resetForm() {
      this.formData = this.getEmptyForm();
      this.$refs.form?.resetValidation?.();
    },
    // Мягкая интеграция с GlobalNotifier:
    // если компонент смонтирован как <GlobalNotifier ref="notifier" />,
    // вызовем notifier.addNotification(message, type)
  }
};
</script>
