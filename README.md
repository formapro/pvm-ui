# PVM UI

PVM UI is a web based user interface for [PVM](https://github.com/formapro/pvm).

## Usage

In PHP:

```php
<?php
namespace Acme;

use Formapro\Pvm\Process;
use Formapro\Pvm\Visual\VisualizeFlow;
use Formapro\Pvm\Visual\BuildDigraphScript;
use function Makasim\Values\get_values;

/** @var  $process */

$graph = (new VisualizeFlow())->createGraph($process);

$pvmContextJson = json_encode([
'process' => get_values($process),
'tokens' => [],
'dot' => (new BuildDigraphScript())->build($graph),
]);

echo $pvmContextJson;
```

In Browser:

```html
<script src="./dist/main.js" type="text/javascript"></script>

<script>
  const pvmContext = JSON.parse(pvmContextJson); 
  pvm.renderGraph(pvmContext);
</script>
```

Check the [demo](https://formapro.github.io/pvm-ui/).

### Build

```bash
yarn
yarn webpack
```

### Run example

```bash
firefox $PWD/index.html
```

## Developed by Forma Pro

Forma Pro is a senior product engineering company helping product organizations build and evolve complex, data-intensive software.

Our public open-source work reflects more than two decades of engineering history, including PHP/Symfony libraries, infrastructure tooling, workflow components, and messaging systems.

Today, our work spans marketplaces and platforms, partner and attribution systems, FinTech, logistics, EdTech, data-intensive workflows, matching and recommendation systems, and applied AI/ML.

Learn more at [forma-pro.com](https://forma-pro.com).

For questions about this project or our open-source work, contact us at opensource@forma-pro.com.

## License

MIT
