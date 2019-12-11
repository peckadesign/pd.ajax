# pd.ajax
Vlastní extensions pro nette.ajax

## Changelog
### 1.4.7
- Extension `uniqueForm` je možno vypnout i na neeajaxových formulářích a to stejným způsobem, jako jinde, tj. pomocí `data-ajax-off="uniqueForm"` buď na formuláři, nebo na tlačítku. Řeší issue [#21](https://github.com/peckadesign/pd.ajax/issues/21).

### 1.4.6
- Přidána chybějící závislost na `nette-forms`.
- Zjednodušení zápisu závislosti na `peckadesign/pdbox`.

### 1.4.5
- úprava dependency nette.ajax.js v package.json

### 1.4.4
- V extension `btnSpinner` se nově neodstraňuje spinner z DOM i v případě, že v JSONu AJAXové odpovědi přijde pole `forceReload`. V tu chvíli je chování extension `btnSpinner` totožné s případem, kdy dojde `forceRedirect`.

### 1.4.3
- V extension `spinner` se nově neodstraňuje spinner z DOM i v případě, že v JSONu AJAXové odpovědi přijde pole `forceReload`. V tu chvíli je chování extension `spinner` totožné s případem, kdy dojde `forceRedirect`.
- **Nové extension:** Přidáno extension `forceReload`, které zajistí znovunačtení stránky v případě, že v odpovědi přišlo `forceRedirect: true`. Pokud je v odpovědi i `_fid`, je přidáno do URL pro načtení.

### 1.4.2
- Oprava titulku stránky v případě, že pdbox obsahuje redirect.

### 1.4.1
- Oprava umístění souborů pro extension `inpCombined` a `inpNumber`.

### 1.4.0
- U pdboxu je možné nastavit způsob fungování historie po zavření. Výchozí je, že po zavření přejde prohlížeč zpět do stavu před otevřením a v historii prohlížeče je pdbox možno otevřít tlačítkem vpřed. Pomocí `data-pdbox-history="forwards"` je možné nastavit, že při zavření se vytvoří nový stav do historie, tj. tlačítko zpět v prohlížeči otevře znovu tento pdbox.
- V jednotlivých extension je v `settings.pd` dostupné pole pro request zapnutých pd extension. 
- Do extension se neukládá každý `xhr`, ale pouze ty, které opravdu souvisí s `pdboxem`. Stejně tak k rušení dojde pouze v případě, že oba requesty (probíhající i nový) souvisí s `pdboxem`. Opravuje #7.
- Přesunutí automatického přidávání class `js-pdbox` (obecně dle nastavení `autoclass` u extension) tak, aby i při `popstate` došlo k nastavení class uvnitř pdboxu, opravuje #15.
- **Nové extension:** Přidáno extension `replaceState` pro zachování změny url bez vytváření nových stavů. Toto extension je možné použít obecně vždy, když chceme mít aktuální url, ale v historii nechceme vytvářet nový stav. Například přepínání barev produktů nebo formuláře v pdboxu.
- **Nové extension:** Přidáno extension `suggest` pro obsluhu našeptávače. Pro funkční použití je potřeba na formulář přidat class `js-suggest`, dále je nutné označit input (`js-suggest__input`), našeptávací tlačítko (`js-suggest__btn`) a snippet s výsledky našeptávání (`js-suggest__suggest`).
- **Nové extension:** Přidáno extension `inpCombined` pro styl inputů s labelem uvnitř.
- **Nové extension:** Přidáno extension `inpNumber` pro inputy s tlačítky + a &minus;.

:warning: **BC break:** původní výchozí chování historie pdboxu bylo to, které je nyní volitelné, tj. vytváření nového stavu po zavření. Pro zachování tohoto chování je potřeba doplnit zmíněný data atribut `data-pdbox-history="forwards"`.

### 1.3.1
- Extension `uniqueForm` nechává tlačítka disabled, pokud v odpovědi přišel `forceRedirect`. V takovém případě není žádoucí odebrat `disabled`, nicméně běží dál 60s limit.

### 1.3.0
- Extension `pdbox` nyní zachovává vypnutí historie pro automaticky zAJAXované odkazy a formuláře uvnitř otevřeného pdboxu. Tj. pokud je historie vypnutá při otevření pdboxu, zůstane i v rámci tohoto pdboxu vypnutá.
- Extension `btnSpinner` je možné použít nejen pro `<button>`, ale pro libovolný element spouštějící AJAXový požadavek (vzhledem k tomu, jak extension funguje, nejde použít např. pro `<input>`, protože do něj nelze vložit html kód).    

### 1.2.3
- oprava chyby `scrollTo` extension, kdy:
  - nebylo možno nastavit přes data atribut offset na 0
  - došlo k JS chybě, pokud nebyl `settings.nette.el`
  
### 1.2.2
- extension `scrollTo` je přepsané pro lepší použití uvnitř otevřeného pdboxu a je více modifikovatelné:
  - přidán nastavení pro scroll offset (výchozí hodnota je 0):
    - globálně: `$.nette.ext('scrollTo').offset = 30;`
    - ad-hoc: `<a href="#" class="ajax" data-scroll-to="#target" data-scroll-to-offset="30">...</a>`
  - přidána možnost nastavit, kdy dochází ke scrollu (podpora `before` a `success`, výchozí je `before`)
    - globálně: `$.nette.ext('scrollTo').defaultEvent = 'success';`
    - ad-hoc `<a href="#" class="ajax" data-scroll-to="#target" data-scroll-to-event="success"></a>`

### 1.2.1
- update závislostí

### 1.2.0
- extension `pdbox` upraveno pro kompatibilitu s `jquery.pdbox` verze `~1.2.0` - tato verze je nyní vyžadována
- oprava JS chyby v extension `pdbox` v případě, kdy byl nějaký AJAXový požadavek vyslán dříve, než byl předán parametr `box`   
- extension `btnSpinner` je možno vypnout i na ne-AJAXových formulářích pomocí data atributu `data-no-spinner` nebo `data-no-btn-spinner`

### 1.1.5
- oprava [#12](https://github.com/peckadesign/pd.ajax/issues/12)

### 1.1.4
- `uniqueForm` extension se nepoužije u neAJAXového formuláře v případě, že má nastaven atribut `target` na otevírání do nového okna ([#9](https://github.com/peckadesign/pd.ajax/issues/9))
- oprava [#7](https://github.com/peckadesign/pd.ajax/issues/7)

### 1.1.3
- oprava `uniqueForm` extension, které v případě abort requestu za určitých okolností mohlo neoddělat `disabled` z tlačítek

### 1.1.2
- oprava [#8](https://github.com/peckadesign/pd.ajax/issues/8) 
- funkce pro získávání placeholderu pro spinner je nyní veřejná, tj. je možné ji použít i v jiném extension

### 1.1.1
- přidána extension `btnSpinner` pro spinner nad tlačítky; jde o `pd` extension, tj. u ajaxových formulářů je nutno ji zapnout, nad neajaxovými formuláři funguje podobně, jako `uniqueForm` extension
- nová extension `ajaxRequest`, která u všech ajaxových requestů přidává do url parametr `ajax`; díky tomu je url pro ajaxovou verzi (obsahující v odpovědi jen snippety) a neeajaxovou (kompletní stránka) unikátní a funguje tak správně cacheování v MS Edge

### 1.1.0
- příprava pro použití s http://github.com/peckadesign/jquery.pdbox verze `~1.1`, **při použití příslušné extension je vyžadována tato verze pdboxu**
- změněn výchozí očekávaný selektor, na kterém je navěšen pdbox, nově `js-pdbox`; pro zachování zpětné kompatibility je možno jej změnit pomocí nastavení `pdboxSelector` a `pdboxAutoClass`
- úprava odstranění `onAfterClose` callbacků, aby se odstranil pouze tímto extension napojený a ne všechny
- při popstate je do open metody pdboxu předáván virtuální DOM element, který je kopií původního elementu a ze kterého je pak přečteno nastavení pro TB

### Starší verze 1.1.*
- viz https://github.com/peckadesign/pd.ajax/releases
