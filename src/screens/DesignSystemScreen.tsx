import { useState, type ReactNode } from 'react';
import {
  Bell,
  CreditCard,
  Heart,
  History,
  LogOut,
  MapPin,
  MessageCircle,
  Search,
  ShoppingBag,
  Sparkles,
  Plus,
  Check,
  Clock,
  Home,
  User,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import BannerSlider from '@/components/ui/BannerSlider';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CategoryScroller from '@/components/ui/CategoryScroller';
import CategoryTile from '@/components/ui/CategoryTile';
import Checkbox from '@/components/ui/Checkbox';
import Chip from '@/components/ui/Chip';
import DishCard from '@/components/ui/DishCard';
import EmptyState from '@/components/ui/EmptyState';
import GroupedList from '@/components/ui/GroupedList';
import Input from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';
import QuantityStepper from '@/components/ui/QuantityStepper';
import Radio from '@/components/ui/Radio';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Skeleton from '@/components/ui/Skeleton';
import StoryPreview from '@/components/ui/StoryPreview';
import StoryViewer from '@/components/ui/StoryViewer';
import TabBar from '@/components/ui/TabBar';
import TextArea from '@/components/ui/TextArea';
import Toggle from '@/components/ui/Toggle';
import WeightSlider from '@/components/ui/WeightSlider';
import { photoByIndex } from '@/lib/productPhotos';
import type { Banner, Category, Slide, Tile } from '@/types';

function Section({
  num,
  title,
  sub,
  children,
}: {
  num: string;
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-3 border-b border-ink-200 pb-2">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[11px] tracking-[0.18em] text-wine uppercase">
            {num}
          </span>
          <h2 className="font-serif text-[28px] leading-none text-ink-900">{title}</h2>
        </div>
        {sub && (
          <span className="text-[11px] tracking-[0.14em] text-ink-500 uppercase">{sub}</span>
        )}
      </header>
      {children}
    </section>
  );
}

function Panel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Card tone="paper" className="flex flex-col gap-4">
      {title && (
        <h3 className="font-serif text-[18px] text-ink-900">{title}</h3>
      )}
      {children}
    </Card>
  );
}

const sampleCategories: Category[] = [
  { id: '1', name: 'салаты', photoUrl: photoByIndex(0), order: 1 },
  { id: '2', name: 'закуски', photoUrl: photoByIndex(1), order: 2 },
  { id: '3', name: 'супы', photoUrl: photoByIndex(2), order: 3 },
  { id: '4', name: 'рыба', photoUrl: photoByIndex(3), order: 4 },
  { id: '5', name: 'шашлыки', photoUrl: photoByIndex(4), order: 5 },
  { id: '6', name: 'десерты', photoUrl: photoByIndex(5), order: 6 },
];

const sampleTiles: Tile[] = [
  { id: '1', kicker: 'горячее', title: 'из казана', count: 24, tone: 'wine', deeplink: '/menu/hot' },
  { id: '2', kicker: 'салаты', title: 'свежий сад', count: 12, tone: 'green', deeplink: '/menu/salads' },
  { id: '3', kicker: 'выпечка', title: 'из тандыра', count: 8, tone: 'sand', deeplink: '/menu/bakery' },
  { id: '4', kicker: 'напитки', title: 'чайхана', count: 16, tone: 'ink', deeplink: '/menu/drinks' },
];

const sampleBanners: Banner[] = [
  {
    id: '1',
    tone: 'red',
    kicker: 'сезон плова',
    title: 'казан\nпо-домашнему',
    cta: 'попробовать',
    deeplink: '/dish/1',
    imageUrl: photoByIndex(6),
  },
  {
    id: '2',
    tone: 'green',
    kicker: '−25%',
    title: 'сад на тарелке',
    cta: 'смотреть',
    deeplink: '/menu/salads',
    imageUrl: photoByIndex(7),
  },
  {
    id: '3',
    tone: 'ink',
    kicker: 'новинка',
    title: 'ночь специй',
    cta: 'открыть',
    deeplink: '/menu/new',
    imageUrl: photoByIndex(8),
  },
];

const sampleStorySlides: Slide[] = [
  {
    type: 'image',
    url: photoByIndex(9),
    cta: { label: 'смотреть блюдо', deeplink: '/dish/1' },
  },
  { type: 'image', url: photoByIndex(10) },
];

export default function DesignSystemScreen() {
  const [activeTab, setActiveTab] = useState('menu');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [weight, setWeight] = useState(300);
  const [qty, setQty] = useState(1);
  const [chipActive, setChipActive] = useState('all');
  const [toggleOn, setToggleOn] = useState(true);
  const [checkbox, setCheckbox] = useState(true);
  const [radio, setRadio] = useState('delivery');
  const [fav, setFav] = useState(false);

  return (
    <div className="min-h-[100dvh] w-full bg-[#EFE6D4] py-10">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-14 px-10">
        <header className="flex items-end justify-between gap-6 border-b border-ink-200 pb-6">
          <div className="flex items-center gap-4">
            <Logo className="h-12 w-auto text-ink-900" />
            <div>
              <div className="font-serif text-[22px] text-ink-900">design system</div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-ink-500 uppercase">
                витрина · v1.1
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] tracking-[0.12em] text-ink-500 uppercase">
            <b className="mb-1 block font-serif text-[18px] text-ink-800 normal-case tracking-normal">
              24 компонента
            </b>
            phase 1 · 2026
          </div>
        </header>

        <Section num="01 / primitives" title="кнопки" sub="variants · sizes · states">
          <Panel title="иерархия">
            <div className="flex flex-wrap gap-3">
              <Button size="lg">добавить в заказ — 890 ₽</Button>
              <Button variant="green" size="lg">оформить заказ</Button>
              <Button variant="secondary" size="lg">в избранное</Button>
              <Button variant="ghost" size="lg">отмена</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button>оформить</Button>
              <Button variant="green">подтвердить</Button>
              <Button variant="mint">вегетарианское</Button>
              <Button variant="green-outline">состав блюда</Button>
              <Button variant="secondary">продолжить</Button>
              <Button variant="dark">войти</Button>
              <Button variant="gold">пригласить друга</Button>
              <Button variant="ghost">позже</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">повторить</Button>
              <Button size="sm" variant="green">готово</Button>
              <Button size="sm" variant="secondary">детали</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="icon" aria-label="добавить"><Plus size={18} strokeWidth={2.2} /></Button>
              <Button size="icon" variant="green" aria-label="готово"><Check size={18} strokeWidth={2.4} /></Button>
              <Button size="icon" variant="secondary" aria-label="избранное"><Heart size={18} strokeWidth={1.8} /></Button>
              <Button size="icon" variant="dark" aria-label="корзина"><ShoppingBag size={18} strokeWidth={1.8} /></Button>
            </div>
          </Panel>
          <Panel title="состояния · primary · green">
            <div className="grid max-w-sm gap-2.5">
              <Button fullWidth>default</Button>
              <Button fullWidth className="bg-burgundy">hover</Button>
              <Button fullWidth disabled>disabled</Button>
              <Button fullWidth variant="green">default · green</Button>
              <Button fullWidth variant="green" className="bg-pine">hover · green</Button>
            </div>
          </Panel>
        </Section>

        <Section num="02 / forms" title="формы" sub="input · textarea · toggles">
          <Panel title="поля ввода">
            <div className="grid max-w-md gap-4">
              <Input label="телефон" placeholder="+7 ___ ___-__-__" defaultValue="+7 900 555-14-23" />
              <Input label="email" type="email" placeholder="you@example.com" />
              <Input
                label="промокод"
                placeholder="SKAZKA24"
                rightAddon={<span className="text-[11px] text-wine">применить</span>}
              />
              <Input
                label="с ошибкой"
                defaultValue="abc"
                error="введите номер в формате +7"
              />
              <TextArea
                label="комментарий курьеру"
                placeholder="домофон, подъезд, время доставки"
                hint="до 200 символов"
              />
            </div>
          </Panel>
          <Panel title="переключатели">
            <div className="flex flex-col gap-3">
              <Checkbox label="согласен с правилами" checked={checkbox} onChange={(e) => setCheckbox(e.target.checked)} />
              <Checkbox label="хочу бумажный чек" defaultChecked />
              <Checkbox label="disabled" disabled />
            </div>
            <div className="flex flex-col gap-3">
              <Radio name="delivery" label="доставка" checked={radio === 'delivery'} onChange={() => setRadio('delivery')} />
              <Radio name="delivery" label="самовывоз —20%" checked={radio === 'pickup'} onChange={() => setRadio('pickup')} />
            </div>
            <div className="flex flex-col gap-3">
              <Toggle label="push-уведомления" checked={toggleOn} onChange={(e) => setToggleOn(e.target.checked)} />
              <Toggle label="сохранять корзину между устройствами" defaultChecked />
            </div>
          </Panel>
          <Panel title="chips">
            <div className="flex flex-wrap gap-2">
              {['all', 'hot', 'salads', 'bakery', 'drinks'].map((key) => (
                <Chip key={key} active={chipActive === key} onClick={() => setChipActive(key)}>
                  {key === 'all' ? 'все' : key === 'hot' ? 'горячее' : key === 'salads' ? 'салаты' : key === 'bakery' ? 'выпечка' : 'напитки'}
                </Chip>
              ))}
            </div>
          </Panel>
        </Section>

        <Section num="03 / containers" title="контейнеры" sub="cards · badges · headers">
          <Panel title="card tones">
            <div className="grid grid-cols-3 gap-3">
              <Card tone="paper">paper tone</Card>
              <Card tone="cream">cream tone</Card>
              <Card tone="white">white tone</Card>
            </div>
          </Panel>
          <Panel title="badges">
            <div className="flex flex-wrap gap-2">
              <Badge tone="wine">новинка</Badge>
              <Badge tone="forest">хит</Badge>
              <Badge tone="mint">вег</Badge>
              <Badge tone="sand">скидка</Badge>
              <Badge tone="indigo">сезон</Badge>
              <Badge tone="success">готово</Badge>
              <Badge tone="warning">мало</Badge>
              <Badge tone="danger">stop</Badge>
              <Badge tone="info">info</Badge>
              <Badge tone="neutral">нейтрально</Badge>
            </div>
          </Panel>
          <Panel title="screen headers">
            <div className="grid gap-4">
              <div className="rounded-lg border border-ink-200 bg-paper">
                <ScreenHeader title="Профиль" />
                <div className="p-4 text-[12px] text-ink-500">variant="default"</div>
              </div>
              <div className="rounded-lg border border-ink-200 bg-paper">
                <ScreenHeader variant="back" title="Шашлык из барашка" subtitle="карточка блюда" />
                <div className="p-4 text-[12px] text-ink-500">variant="back"</div>
              </div>
              <div className="rounded-lg border border-ink-200 bg-paper">
                <ScreenHeader variant="large" title="добро пожаловать" subtitle="меню · сегодня" />
                <div className="p-4 text-[12px] text-ink-500">variant="large"</div>
              </div>
            </div>
          </Panel>
        </Section>

        <Section num="04 / dishes" title="карточка блюда" sub="hero · grid · list">
          <Panel title="крупная (hero)">
            <div className="max-w-[280px]">
              <DishCard
                variant="hero"
                name="овощи на мангале"
                price={690}
                weight={300}
                meta="15 мин"
                photoUrl={photoByIndex(11)}
                tag={{ label: 'новинка' }}
                favorited={fav}
                onToggleFavorite={() => setFav(!fav)}
                onAdd={() => undefined}
              />
            </div>
          </Panel>
          <Panel title="каталог (grid)">
            <div className="grid max-w-md grid-cols-2 gap-3">
              <DishCard
                name="шурпа из баранины"
                price={780}
                weight={500}
                meta="острое"
                photoUrl={photoByIndex(12)}
                onAdd={() => undefined}
              />
              <DishCard
                name="мясо по-королевски"
                price={920}
                weight={350}
                meta="гарнир"
                photoUrl={photoByIndex(13)}
                tag={{ label: 'хит', tone: 'forest' }}
                onAdd={() => undefined}
              />
              <DishCard
                name="курица с лепёшкой"
                price={750}
                weight={400}
                photoUrl={photoByIndex(14)}
                onAdd={() => undefined}
                unavailable
              />
              <DishCard
                name="десерт без фото"
                price={320}
                weight={120}
                photoUrl={null}
                onAdd={() => undefined}
              />
            </div>
          </Panel>
          <Panel title="список (list)">
            <div className="max-w-md divide-y divide-ink-100">
              {[15, 16, 17].map((i, idx) => (
                <DishCard
                  key={idx}
                  variant="list"
                  name={['курица с лепёшкой', 'шурпа', 'овощи гриль'][idx]}
                  price={[750, 780, 690][idx]}
                  weight={[400, 500, 300][idx]}
                  meta={['20 мин', 'острое', '15 мин'][idx]}
                  photoUrl={photoByIndex(i)}
                />
              ))}
            </div>
          </Panel>
        </Section>

        <Section num="05 / interactive" title="интерактивные" sub="weight slider · quantity · tabs">
          <Panel title="ползунок веса · непрерывный drag">
            <div className="max-w-md rounded-lg border border-cream-deep bg-cream p-5">
              <div className="mb-4 flex items-baseline justify-between">
                <h4 className="font-serif text-[18px] text-ink-900">шашлык</h4>
                <span className="font-serif text-[26px] text-wine">
                  {Math.round((weight * 3.6) / 10) * 10} ₽
                </span>
              </div>
              <WeightSlider value={weight} onChange={setWeight} min={100} max={1000} step={10} />
              <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-ink-500">
                <span>выбрано</span>
                <span className="font-serif text-[16px] text-wine">{weight} г</span>
              </div>
            </div>
          </Panel>
          <Panel title="степпер количества">
            <div className="flex items-center gap-6">
              <QuantityStepper value={qty} onChange={setQty} />
              <QuantityStepper value={qty} onChange={setQty} size="sm" />
            </div>
          </Panel>
          <Panel title="таб-бар · 5 разделов">
            <div className="max-w-md">
              <TabBar
                items={[
                  { key: 'menu', label: 'меню', icon: <Home size={22} strokeWidth={1.6} /> },
                  { key: 'search', label: 'поиск', icon: <Search size={22} strokeWidth={1.6} /> },
                  { key: 'cart', label: 'корзина', icon: <ShoppingBag size={22} strokeWidth={1.6} />, badge: 3 },
                  { key: 'orders', label: 'заказы', icon: <Clock size={22} strokeWidth={1.6} /> },
                  { key: 'profile', label: 'профиль', icon: <User size={22} strokeWidth={1.6} /> },
                ]}
                activeKey={activeTab}
                onSelect={setActiveTab}
              />
            </div>
          </Panel>
        </Section>

        <Section num="06 / stories" title="сторис · просмотрщик" sub="preview · viewer">
          <Panel title="лента превью">
            <div className="flex max-w-lg gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
              <StoryPreview imageUrl={photoByIndex(0)} label="овощи гриль" onClick={() => setStoryOpen(true)} />
              <StoryPreview imageUrl={photoByIndex(1)} label="шурпа" />
              <StoryPreview flatLabel="−20%" label="скидка дня" accent="wine" />
              <StoryPreview imageUrl={photoByIndex(2)} label="курица" seen />
              <StoryPreview flatLabel="ид" label="ифтар" accent="forest" seen />
              <StoryPreview imageUrl={photoByIndex(3)} label="мясное" seen />
              <StoryPreview flatLabel="✦" label="подарок" accent="midnight" seen />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStoryOpen(true)}>
                открыть просмотрщик
              </Button>
            </div>
          </Panel>
        </Section>

        <Section num="07 / banners + tiles" title="баннеры · плитки" sub="slider · tiles">
          <Panel title="баннер-слайдер">
            <div className="max-w-md">
              <BannerSlider banners={sampleBanners} />
            </div>
          </Panel>
          <Panel title="цветные плитки-ярлыки">
            <div className="grid max-w-md grid-cols-2 gap-2.5">
              {sampleTiles.map((tile) => (
                <CategoryTile key={tile.id} tile={tile} />
              ))}
            </div>
          </Panel>
          <Panel title="скроллер категорий · 72px">
            <div className="max-w-md -mx-4">
              <CategoryScroller categories={sampleCategories} activeId="1" />
            </div>
          </Panel>
        </Section>

        <Section num="08 / bottom sheet" title="bottom sheet" sub="modal · 90% viewport">
          <Panel title="карточка блюда">
            <Button variant="green" onClick={() => setSheetOpen(true)}>
              открыть bottom sheet
            </Button>
          </Panel>
        </Section>

        <Section num="09 / lists" title="группированные списки" sub="profile · settings">
          <Panel title="профиль">
            <div className="max-w-md">
              <GroupedList
                title="контакт"
                items={[
                  {
                    id: 'phone',
                    icon: <User size={18} strokeWidth={1.6} />,
                    label: '+7 900 555-14-23',
                    description: 'изменить',
                  },
                ]}
              />
            </div>
            <div className="max-w-md">
              <GroupedList
                title="дополнительно"
                items={[
                  {
                    id: 'orders',
                    icon: <History size={18} strokeWidth={1.6} />,
                    label: 'история заказов',
                    description: '14 позиций',
                  },
                  {
                    id: 'addresses',
                    icon: <MapPin size={18} strokeWidth={1.6} />,
                    label: 'адреса доставки',
                  },
                  {
                    id: 'cards',
                    icon: <CreditCard size={18} strokeWidth={1.6} />,
                    label: 'платёжные карты',
                  },
                  {
                    id: 'chat',
                    icon: <MessageCircle size={18} strokeWidth={1.6} />,
                    label: 'книга отзывов',
                  },
                  {
                    id: 'notifications',
                    icon: <Bell size={18} strokeWidth={1.6} />,
                    label: 'уведомления',
                  },
                  {
                    id: 'logout',
                    icon: <LogOut size={18} strokeWidth={1.6} />,
                    label: 'выйти',
                    danger: true,
                  },
                ]}
              />
            </div>
          </Panel>
        </Section>

        <Section num="10 / states" title="состояния" sub="empty · skeleton">
          <Panel title="пустое состояние">
            <div className="max-w-md">
              <EmptyState
                icon={<ShoppingBag size={24} strokeWidth={1.6} />}
                title="корзина пуста"
                description="загляните в меню — самое вкусное ждёт на скатерти-самобранке"
                action={<Button size="sm" variant="green">открыть меню</Button>}
              />
            </div>
          </Panel>
          <Panel title="скелетоны">
            <div className="grid max-w-md grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Skeleton className="aspect-square" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="aspect-square" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          </Panel>
        </Section>

        <footer className="mt-8 grid grid-cols-[1fr_auto] items-center gap-5 rounded-lg bg-midnight p-6 text-cream">
          <div>
            <b className="mb-1 block font-serif text-[22px]">
              сказка востока · design system v1.1
            </b>
            <span className="text-[12px] tracking-[0.12em] text-cream/70 uppercase">
              alice + roboto flex · 8-point grid · mobile web
            </span>
          </div>
          <div className="font-serif text-[22px] text-sand">◆ ✦ ◆</div>
        </footer>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} ariaLabel="Карточка блюда">
        <div className="flex flex-col gap-3 px-5 pb-5">
          <div className="relative -mx-5 mb-2 h-[220px] overflow-visible">
            <div
              className="pointer-events-none absolute top-[-10%] left-1/2 z-0"
              style={{ width: 260, height: 260, marginLeft: -130 }}
            >
              <img
                src={photoByIndex(4)}
                alt=""
                className="h-full w-full object-contain"
                style={{ animation: 'sheet-dish-spin 60s linear infinite' }}
              />
            </div>
            <span className="absolute bottom-3 left-3 rounded-full bg-wine px-3 py-1.5 text-[10px] font-semibold text-cream uppercase tracking-[0.18em] shadow-[0_6px_14px_-6px_rgba(90,16,20,0.5)]">
              хит
            </span>
          </div>
          <div className="flex items-start justify-between gap-2.5">
            <div>
              <h3 className="font-serif text-[24px] leading-tight text-ink-900">
                шашлык из молодого барашка
              </h3>
              <div className="mt-1 text-[12px] text-ink-500">с морковью по-корейски и зеленью</div>
            </div>
            <span className="font-serif text-[24px] whitespace-nowrap text-wine">1 080 ₽</span>
          </div>
          <p className="text-[13px] leading-relaxed text-ink-700">
            Рёбрышки молодого барашка, маринованные в луке и специях, на углях.
            Подаются с морковью по-корейски, маринованным луком и свежей зеленью.
          </p>
          <div>
            <div className="mb-4 font-serif text-[16px] text-ink-900">порция</div>
            <WeightSlider value={weight} onChange={setWeight} min={150} max={800} step={10} />
            <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-ink-500">
              <span>выбрано</span>
              <span className="font-serif text-[16px] text-wine">{weight} г</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip active>острый соус</Chip>
            <Chip>лаваш</Chip>
            <Chip>лук</Chip>
            <Chip>морковь</Chip>
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <Button variant="secondary">в избранное</Button>
            <Button variant="green" leftIcon={<Sparkles size={16} />}>
              добавить — {Math.round((weight * 3.6) / 10) * 10} ₽
            </Button>
          </div>
        </div>
      </BottomSheet>

      <StoryViewer
        open={storyOpen}
        slides={sampleStorySlides}
        onClose={() => setStoryOpen(false)}
      />
    </div>
  );
}
