import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useAddressesStore } from '@/stores/addresses';

const schema = z.object({
  street: z.string().min(2, 'введите улицу'),
  house: z.string().min(1, 'введите номер дома'),
  apartment: z.string().optional(),
  entrance: z.string().optional(),
  floor: z.string().optional(),
  comment: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function AddressesScreen() {
  const navigate = useNavigate();
  const { list, add, remove } = useAddressesStore();
  const [formOpen, setFormOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      street: '',
      house: '',
      apartment: '',
      entrance: '',
      floor: '',
      comment: '',
    },
  });

  const onSubmit = form.handleSubmit((v) => {
    add({
      line: `${v.street}, ${v.house}${v.apartment ? `, кв. ${v.apartment}` : ''}`,
      entrance: v.entrance,
      floor: v.floor,
      flat: v.apartment,
      comment: v.comment,
    });
    form.reset();
    setFormOpen(false);
  });

  return (
    <div className="flex flex-col bg-paper">
      <ScreenHeader
        variant="back"
        title="адреса доставки"
        onBack={() => navigate('/profile')}
        rightSlot={
          !formOpen ? (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              aria-label="добавить адрес"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-wine text-cream hover:bg-burgundy"
            >
              <Plus size={18} strokeWidth={2} />
            </button>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 px-4 pt-2 pb-8">
        <AnimatePresence>
          {formOpen && (
            <motion.form
              onSubmit={onSubmit}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-3 rounded-lg border border-cream-deep bg-cream-soft p-4">
                <h3 className="font-serif text-[18px] text-ink-900">новый адрес</h3>
                <Input
                  label="улица"
                  placeholder="Ленинский проспект"
                  {...form.register('street')}
                  error={form.formState.errors.street?.message}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="дом"
                    placeholder="12"
                    {...form.register('house')}
                    error={form.formState.errors.house?.message}
                  />
                  <Input label="квартира" placeholder="45" {...form.register('apartment')} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="подъезд" placeholder="2" {...form.register('entrance')} />
                  <Input label="этаж" placeholder="4" {...form.register('floor')} />
                </div>
                <Input
                  label="комментарий"
                  placeholder="домофон, код подъезда"
                  {...form.register('comment')}
                />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      form.reset();
                      setFormOpen(false);
                    }}
                  >
                    отмена
                  </Button>
                  <Button type="submit" variant="green">
                    сохранить
                  </Button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {list.length === 0 && !formOpen ? (
          <EmptyState
            icon={<MapPin size={24} strokeWidth={1.6} />}
            title="нет адресов"
            description="добавьте первый — пригодится при оформлении заказа"
            action={
              <Button variant="green" size="sm" onClick={() => setFormOpen(true)}>
                добавить адрес
              </Button>
            }
          />
        ) : (
          <AnimatePresence initial={false}>
            {list.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3 rounded-lg border border-ink-100 bg-white p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cream-soft text-wine">
                  <MapPin size={18} strokeWidth={1.6} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-[16px] leading-tight text-ink-900">
                    {a.line}
                  </div>
                  {(a.entrance || a.floor) && (
                    <div className="mt-0.5 text-[12px] text-ink-500">
                      {a.entrance && `подъезд ${a.entrance}`}
                      {a.entrance && a.floor && ' · '}
                      {a.floor && `этаж ${a.floor}`}
                    </div>
                  )}
                  {a.comment && (
                    <div className="mt-1 text-[12px] text-ink-500">{a.comment}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  aria-label="удалить адрес"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 size={16} strokeWidth={1.6} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
