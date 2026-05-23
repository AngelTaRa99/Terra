'use client';

interface ContactFormProps {
  contactEmail?: string;
}

export function ContactForm({ contactEmail = '' }: ContactFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const nombre = data.get('nombre') as string;
    const email = data.get('email') as string;
    const mensaje = data.get('mensaje') as string;
    const subject = encodeURIComponent('Solicitud de cita - Proyecto Terra');
    const body = encodeURIComponent(
      `Nombre: ${nombre}\nCorreo: ${email}\nMensaje: ${mensaje}`
    );
    if (contactEmail) {
      window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    } else {
      alert('Solicitud de cita enviada. Nos pondremos en contacto pronto.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">
        Agendar una cita
      </h4>
      <input
        type="text"
        name="nombre"
        placeholder="Tu nombre"
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none"
        style={{ borderColor: 'var(--color-primary)', borderWidth: 1 }}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Tu correo electrónico"
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none"
        style={{ borderColor: 'var(--color-primary)', borderWidth: 1 }}
        required
      />
      <textarea
        name="mensaje"
        placeholder="Mensaje (opcional)"
        rows={3}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none"
        style={{ borderColor: 'var(--color-primary)', borderWidth: 1 }}
      />
      <button
        type="submit"
        className="w-full rounded px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        Solicitar cita
      </button>
    </form>
  );
}
