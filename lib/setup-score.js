const os = require('os');
const path = require('path');

const core = require('@actions/core');
const gh = require('@actions/github');
const tc = require('@actions/tool-cache');

// arch in [arm, x32, x64...] (https://nodejs.org/api/os.html#os_os_arch)
// return value in [amd64, 386, arm]
function mapArch(arch) {
  const mappings = {
    x32: '386',
    x64: 'amd64'
  };
  return mappings[arch] || arch;
}

// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
function mapOS(os) {
  const mappings = {
    macOS: 'darwin',
    win32: 'windows',
    win64: 'windows'
  };
  return mappings[os] || os;
}

async function getBestVersion(file, version) {
  if (version === 'latest') {
    const octokit = gh.getOctokit()
    const response = await octokit.repos.getLatestRelease({
      owner: 'score-spec',
      repo: file
    })
    return response.data.tag_name
  }

  return version
}

async function getDownloadUrl(file, version) {
  version = await getBestVersion(file, version)

  const platform = mapOS(os.platform());
  const arch = mapArch(os.arch());

  const filename = `${ file }_${ version }_${ platform }_${ arch }`;
  const extension = platform === 'windows' ? 'zip' : 'tar.gz';
  const binPath = platform === 'windows' ? 'bin' : '';

  let headers = undefined;
  let url = `https://github.com/score-spec/${ file }/releases/download/${ version }/${ filename }.${ extension }`

  return {
    url,
    binPath,
    headers
  };
}

async function run() {
  const file = core.getInput('file');
  const version = core.getInput('version');
  const download = await getDownloadUrl(file, version);
  
  console.log(`Downloading: ${ download.url }`);
  const pathToTarball = await tc.downloadTool(download.url, undefined, undefined, download.headers);

  const extract = download.url.endsWith('.zip') ? tc.extractZip : tc.extractTar;
  const pathToCLI = await extract(pathToTarball);
  
  const pathToBin = path.join(pathToCLI, download.binPath)
  console.log(`Registering path: ${ pathToBin }`);
  core.addPath(pathToBin);
}

module.exports = run;