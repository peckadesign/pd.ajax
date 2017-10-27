# pd.ajax
Vlastní extensions pro nette.ajax

## Changelog

### 1.1.2
- oprava [#8](https://github.com/peckadesign/pd.ajax/issues/8) 
- funkce pro získávání placeholderu pro spinner je nyní veřejná, tj. je možné ji použít i v jiném extension

### 1.1.1
- přidána extension `btnSpinner` pro spinner nad tlačítky; jde o `pd` extension, tj. u ajaxových formulářů je nutno ji zapnout, nad neajaxovými formuláři funguje podobně, jako `uniqueForm` extension
- nová extension `ajaxRequest`, která u všech ajaxových requestů přidává do url parametr `ajax`; díky tomu je url pro ajaxovou verzi (obsahující v odpovědi jen snippety) a neeajaxovou (kompletní stránka) unikátní a funguje tak správně cacheování v MS Edge

### 1.1.0
- příprava pro použití s http://github.com/peckadesign/jquery.pdbox verze `~1.1`, **při použití příslušné extension je vyžadována tato verze pdboxu**
- změněn výchozí očekávaný selektor, na kterém je navěšen pdbox, nově `js-pdbox`; pro zachování zpětné kompatibility je možno jej změn pomocí nastavení `pdboxSelector` a ``
- úprava odstranění `onAfterClose` callbacků, aby se odstranil pouze tímto extension napojený a ne všechny
- při popstate je do open metody pdboxu předáván virtuální DOM element, který je kopií původního elementu a ze kterého je pak přečteno nastavení pro TB

### Starší verze 1.1.*
- viz https://github.com/peckadesign/pd.ajax/releases
