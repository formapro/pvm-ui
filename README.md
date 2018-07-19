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

Check the [demo](https://github.com/makasim/pvm-ui).

### Build

```bash
yarn
yarn webpack
```

### Run example

```bash
firefox $PWD/index.html
```
