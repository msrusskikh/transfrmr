"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function OfertaPage() {
  const router = useRouter()
  
  useEffect(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 items-center px-4 justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-foreground">Трансформер</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transform group-hover:-translate-x-1 transition-transform"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Назад</span>
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            ПУБЛИЧНАЯ ОФЕРТА
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            о заключении договора об оказании услуг
          </p>
          <div className="prose prose-invert max-w-none space-y-6 text-foreground">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Общие положения</h2>
              <p className="text-muted-foreground leading-relaxed">
                В настоящей Публичной оферте содержатся условия заключения Договора об оказании услуг (далее по тексту - «Договор об оказании услуг» и/или «Договор»). Настоящей офертой признается предложение, адресованное одному или нескольким конкретным лицам, которое достаточно определенно и выражает намерение лица, сделавшего предложение, считать себя заключившим Договор с адресатом, которым будет принято предложение.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Совершение указанных в настоящей Оферте действий является подтверждением согласия обеих Сторон заключить Договор об оказании услуг на условиях, в порядке и объеме, изложенных в настоящей Оферте.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Нижеизложенный текст Публичной оферты является официальным публичным предложением Исполнителя, адресованный заинтересованному кругу лиц заключить Договор об оказании услуг в соответствии с положениями пункта 2 статьи 437 Гражданского кодекса РФ.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Договор об оказании услуг считается заключенным и приобретает силу с момента совершения Сторонами действий, предусмотренных в настоящей Оферте, и, означающих безоговорочное, а также полное принятие всех условий настоящей Оферты без каких-либо изъятий или ограничений на условиях присоединения.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Термины и определения:</h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Договор</strong> – текст настоящей Оферты с Приложениями, являющимися неотъемлемой частью настоящей Оферты, акцептованный Заказчиком путем совершения конклюдентных действий, предусмотренных настоящей Офертой.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Конклюдентные действия</strong> — это поведение, которое выражает согласие с предложением контрагента заключить, изменить или расторгнуть договор. Действия состоят в полном или частичном выполнении условий, которые предложил контрагент.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Сайт Исполнителя в сети «Интернет»</strong> – совокупность программ для электронных вычислительных машин и иной информации, содержащейся в информационной системе, доступ к которой обеспечивается посредством сети «Интернет» по доменному имени и сетевому адресу: https://www.transfrmr.ai/
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Стороны Договора (Стороны)</strong> – Исполнитель и Заказчик.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Услуга</strong> – услуга, оказываемая Исполнителем Заказчику в порядке и на условиях, установленных настоящей Офертой.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Предмет Договора</h2>
              <p className="text-muted-foreground leading-relaxed">
                Исполнитель обязуется оказать Заказчику Услуги, а Заказчик обязуется оплатить их в размере, порядке и сроки, установленные настоящим Договором.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Наименование, количество, порядок и иные условия оказания Услуг определяются на основании сведений Исполнителя при оформлении заявки Заказчиком, либо устанавливаются на сайте Исполнителя в сети «Интернет» https://www.transfrmr.ai/
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Исполнитель оказывает Услуги по настоящему Договору лично, либо с привлечением третьих лиц, при этом за действия третьих лиц Исполнитель отвечает перед Заказчиком как за свои собственные.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Договор заключается путем акцепта настоящей Оферты через совершение конклюдентных действий, выраженных в:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>действиях, связанных с регистрацией учетной записи на Сайте Исполнителя в сети «Интернет» при наличии необходимости регистрации учетной записи;</li>
                <li>оформлении и направлении Заказчиком заявки в адрес Исполнителя для оказания Услуг;</li>
                <li>действиях, связанных с оплатой Услуг Заказчиком;</li>
                <li>действиях, связанных с оказанием Услуг Исполнителем.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Данный перечень неисчерпывающий, могут быть и другие действия, которые ясно выражают намерение лица принять предложение контрагента.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Права и обязанности Сторон</h2>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Права и обязанности Исполнителя:</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Исполнитель обязуется оказать Услуги в соответствии с положениями настоящего Договора, в сроки и объеме, указанные в настоящем Договоре и (или) в порядке, указанном на Сайте Исполнителя.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Исполнитель обязуется предоставлять Заказчику доступ к разделам Сайта, необходимым для получения информации, согласно пункту 2.1. Договора.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Исполнитель несет ответственность за хранение и обработку персональных данных Заказчика, обеспечивает сохранение конфиденциальности этих данных и использует их исключительно для качественного оказания Услуг Заказчику.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Исполнитель оставляет за собой право изменять сроки (период) оказания Услуг и условия настоящей Оферты в одностороннем порядке без предварительного уведомления Заказчика, публикуя указанные изменения на Сайте Исполнителя в сети «Интернет».
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  При этом новые / измененные условия, указываемые на Сайте, действуют только в отношении вновь заключаемых Договоров.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Права и обязанности Заказчика:</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Заказчик обязан предоставлять достоверную информацию о себе при получении соответствующих Услуг.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Заказчик обязуется не воспроизводить, не повторять, не копировать, не продавать, а также не использовать в каких бы то ни было целях информацию и материалы, ставшие ему доступными в связи с оказанием Услуг, за исключением личного использования непосредственно самим Заказчиком без предоставления в какой-либо форме доступа каким-либо третьим лицам.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Заказчик обязуется принять Услуги, оказанные Исполнителем;
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Заказчик вправе потребовать от Исполнителя вернуть денежные средства за неоказанные услуги, некачественно оказанные услуги, услуги, оказанные с нарушением сроков оказания, а также, если Заказчик решил отказаться от услуг по причинам, не связанным с нарушением обязательств со стороны Исполнителя, исключительно по основаниям, предусмотренным действующим законодательством Российской Федерации.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Заказчик гарантирует, что все условия Договора ему понятны; Заказчик принимает условия без оговорок, а также в полном объеме.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Цена и порядок расчетов</h2>
              <p className="text-muted-foreground leading-relaxed">
                Стоимость услуг Исполнителя, оказываемых Заказчиком и порядок их оплаты, определяются на основании сведений Исполнителя при оформлении заявки Заказчиком либо устанавливаются на Сайте Исполнителя в сети «Интернет»: https://www.transfrmr.ai/
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Все расчеты по Договору производятся в безналичном порядке.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Конфиденциальность и безопасность</h2>
              <p className="text-muted-foreground leading-relaxed">
                При реализации настоящего Договора Стороны обеспечивают конфиденциальность и безопасность персональных данных в соответствии с актуальной редакцией ФЗ от 27.07.2006 г. № 152-ФЗ «О персональных данных» и ФЗ от 27.07.2006 г. № 149-ФЗ «Об информации, информационных технологиях и о защите информации».
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Стороны обязуются сохранять конфиденциальность информации, полученной в ходе исполнения настоящего Договора, и принять все возможные меры, чтобы предохранить полученную информацию от разглашения.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Под конфиденциальной информацией понимается любая информация, передаваемая Исполнителем и Заказчиком в процессе реализации Договора и подлежащая защите, исключения указаны ниже.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Такая информация может содержаться в предоставляемых Исполнителю локальных нормативных актах, договорах, письмах, отчетах, аналитических материалах, результатах исследований, схемах, графиках, спецификациях и других документах, оформленных как на бумажных, так и на электронных носителях.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Форс-мажор</h2>
              <p className="text-muted-foreground leading-relaxed">
                Стороны освобождаются от ответственности за неисполнение или ненадлежащее исполнение обязательств по Договору, если надлежащее исполнение оказалось невозможным вследствие непреодолимой силы, то есть чрезвычайных и непредотвратимых при данных условиях обстоятельств, под которыми понимаются: запретные действия властей, эпидемии, блокада, эмбарго, землетрясения, наводнения, пожары или другие стихийные бедствия.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                В случае наступления этих обстоятельств Сторона обязана в течение 30 (Тридцати) рабочих дней уведомить об этом другую Сторону.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Документ, выданный уполномоченным государственным органом, является достаточным подтверждением наличия и продолжительности действия непреодолимой силы.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Если обстоятельства непреодолимой силы продолжают действовать более 60 (Шестидесяти) рабочих дней, то каждая Сторона вправе отказаться от настоящего Договора в одностороннем порядке.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Ответственность Сторон</h2>
              <p className="text-muted-foreground leading-relaxed">
                В случае неисполнения и/или ненадлежащего исполнения своих обязательств по Договору, Стороны несут ответственность в соответствии с условиями настоящей Оферты.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Исполнитель не несет ответственности за неисполнение и/или ненадлежащее исполнение обязательств по Договору, если такое неисполнение и/или ненадлежащее исполнение произошло по вине Заказчика.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Сторона, не исполнившая или ненадлежащим образом исполнившая обязательства по Договору, обязана возместить другой Стороне причиненные такими нарушениями убытки.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Срок действия настоящей Оферты</h2>
              <p className="text-muted-foreground leading-relaxed">
                Оферта вступает в силу с момента размещения на Сайте Исполнителя и действует до момента её отзыва Исполнителем.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Исполнитель оставляет за собой право внести изменения в условия Оферты и/или отозвать Оферту в любой момент по своему усмотрению. Сведения об изменении или отзыве Оферты доводятся до Заказчика по выбору Исполнителя посредством размещения на сайте Исполнителя в сети «Интернет», в Личном кабинете Заказчика, либо путем направления соответствующего уведомления на электронный или почтовый адрес, указанный Заказчиком при заключении Договора или в ходе его исполнения.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Договор вступает в силу с момента Акцепта условий Оферты Заказчиком и действует до полного исполнения Сторонами обязательств по Договору.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Изменения, внесенные Исполнителем в Договор и опубликованные на сайте в форме актуализированной Оферты, считаются принятыми Заказчиком в полном объеме.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Дополнительные условия</h2>
              <p className="text-muted-foreground leading-relaxed">
                Договор, его заключение и исполнение регулируется действующим законодательством Российской Федерации. Все вопросы, не урегулированные настоящей Офертой или урегулированные не полностью, регулируются в соответствии с материальным правом Российской Федерации.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                В случае возникновения спора, который может возникнуть между Сторонами в ходе исполнения ими своих обязательств по Договору, заключенному на условиях настоящей Оферты, Стороны обязаны урегулировать спор мирным путем до начала судебного разбирательства.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Судебное разбирательство осуществляется в соответствии с законодательством Российской Федерации.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Споры или разногласия, по которым Стороны не достигли договоренности, подлежат разрешению в соответствии с законодательством РФ. Досудебный порядок урегулирования спора является обязательным.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                В качестве языка Договора, заключаемого на условиях настоящей Оферты, а также языка, используемого при любом взаимодействии Сторон (включая ведение переписки, предоставление требований / уведомлений / разъяснений, предоставление документов и т. д.), Стороны определили русский язык.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Все документы, подлежащие предоставлению в соответствии с условиями настоящей Оферты, должны быть составлены на русском языке либо иметь перевод на русский язык, удостоверенный в установленном порядке.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Бездействие одной из Сторон в случае нарушения условий настоящей Оферты не лишает права заинтересованной Стороны осуществлять защиту своих интересов позднее, а также не означает отказа от своих прав в случае совершения одной из Сторон подобных либо сходных нарушений в будущем.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Если на Сайте Исполнителя в сети «Интернет» есть ссылки на другие веб-сайты и материалы третьих лиц, такие ссылки размещены исключительно в целях информирования, и Исполнитель не имеет контроля в отношении содержания таких сайтов или материалов. Исполнитель не несет ответственность за любые убытки или ущерб, которые могут возникнуть в результате использования таких ссылок.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Реквизиты Исполнителя</h2>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>Русских Максим Сергеевич</p>
                <p>ИНН 770475475401</p>
                <p><strong className="text-foreground">Контактный телефон:</strong> +7 915 165-46-33</p>
                <p><strong className="text-foreground">Контактный e-mail:</strong> msrusskikh@gmail.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-border/30">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground/60 font-mono tracking-wide">
            <div className="w-1.5 h-1.5 bg-green-500/70 rounded-full"></div>
            <span>Powered by OpenAI</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

