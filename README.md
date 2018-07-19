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

## Developed by Forma-Pro

Forma-Pro is a full stack development company which interests also spread to open source development. 
Being a team of strong professionals we have an aim an ability to help community by developing cutting edge solutions in the areas of e-commerce, docker & microservice oriented architecture where we have accumulated a huge many-years experience. 
Our main specialization is Symfony framework based solution, but we are always looking to the technologies that allow us to do our job the best way. We are committed to creating solutions that revolutionize the way how things are developed in aspects of architecture & scalability.

If you have any questions and inquires about our open source development, this product particularly or any other matter feel free to contact at opensource@forma-pro.com

## License

MIT
