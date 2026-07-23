/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneCall } from 'lucide-react';

export default function WhatsAppButton() {
  const phoneNumber = '5581984442592'; // Estrito para Vitor Leonardo: +55 81 98444-2592
  const message = encodeURIComponent(
    'Olá Eng. Vitor Leonardo, gostaria de solicitar um orçamento para laudo técnico de engenharia mecânica.'
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      id="whatsapp-floating-button"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-5 py-3.5 rounded-full shadow-2xl hover:bg-[#20ba59] hover:scale-110 active:scale-95 transition-all duration-300 font-medium group text-sm md:text-base animate-pulse hover:animate-none"
      title="Falar no WhatsApp"
    >
      <PhoneCall className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
      <span>Falar no WhatsApp</span>
    </a>
  );
}
