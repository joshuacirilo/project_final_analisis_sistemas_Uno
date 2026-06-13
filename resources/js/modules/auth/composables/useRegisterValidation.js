const NAME_PATTERN = /^[\p{L}\s\-'.]+$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const MESSAGES = {
    tenantId: {
        required: 'El ID de tenant es obligatorio.',
    },
    name: {
        required: 'El nombre es obligatorio.',
        min: 'El nombre debe tener al menos 2 caracteres.',
        format: 'El nombre solo puede contener letras, espacios, guiones y apóstrofes.',
    },
    email: {
        required: 'El correo electrónico es obligatorio.',
        format: 'Ingresa un correo electrónico válido.',
    },
    password: {
        required: 'La contraseña es obligatoria.',
        strength: 'La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y un símbolo.',
    },
    passwordConfirmation: {
        required: 'Debes confirmar la contraseña.',
        mismatch: 'Las contraseñas no coinciden.',
    },
};

/**
 * Validación local del formulario de registro (sin API).
 *
 * @param {{ tenantId: string, name: string, email: string, password: string, passwordConfirmation: string }} form
 * @returns {{ errors: Record<string, string>, isValid: boolean }}
 */
export function validateRegisterForm(form) {
    /** @type {Record<string, string>} */
    const errors = {};

    const tenantId = form.tenantId?.trim() ?? '';
    const name = form.name?.trim() ?? '';
    const email = form.email?.trim().toLowerCase() ?? '';
    const password = form.password ?? '';
    const passwordConfirmation = form.passwordConfirmation ?? '';

    if (! tenantId) {
        errors.tenantId = MESSAGES.tenantId.required;
    }

    if (! name) {
        errors.name = MESSAGES.name.required;
    } else if (name.length < 2) {
        errors.name = MESSAGES.name.min;
    } else if (! NAME_PATTERN.test(name)) {
        errors.name = MESSAGES.name.format;
    }

    if (! email) {
        errors.email = MESSAGES.email.required;
    } else if (! EMAIL_PATTERN.test(email)) {
        errors.email = MESSAGES.email.format;
    }

    if (! password) {
        errors.password = MESSAGES.password.required;
    } else if (! PASSWORD_PATTERN.test(password)) {
        errors.password = MESSAGES.password.strength;
    }

    if (! passwordConfirmation) {
        errors.passwordConfirmation = MESSAGES.passwordConfirmation.required;
    } else if (password !== passwordConfirmation) {
        errors.passwordConfirmation = MESSAGES.passwordConfirmation.mismatch;
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0,
    };
}

export { MESSAGES as registerValidationMessages };
