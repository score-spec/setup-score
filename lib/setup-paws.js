const os = require('os');
const path = require('path');

const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const github = require('@actions/github');

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

async function getDownloadUrl(version, token) {
  const platform = mapOS(os.platform());
  const arch = mapArch(os.arch());

  const filename = `paws_${ version }_${ platform }_${ arch }`;
  const extension = platform === 'windows' ? 'zip' : 'tar.gz';
  const binPath = platform === 'windows' ? 'bin' : '';
  
  let headers = undefined;
  let url = "";  
  if (!token) {
    url = `https://github.com/humanitec/paws/releases/download/${ version }/${ filename }.${ extension }`
  } else {
    const octokit = new github.GitHub(token);
    
    let resp;
    if (version === "latest") {
        resp = await octokit.repos.getLatestRelease({
            owner: "Humanitec",
            repo: "paws",
        })
    } else {
        resp = await octokit.repos.getReleaseByTag({
            owner: "Humanitec",
            repo: "paws",
            tag: version,
        })
    }

    // Find the first asset that matches the platform and the arch
    let re = new RegExp(`${ platform }.*${ arch }.*${ extension }`)
    let asset = resp.data.assets.find(obj => {
        return re.test(obj.name)
    })

    if (!asset ) {
      const found = resp.data.assets.map(f => f.name)
      throw new Error(
        `Could not find a release for ${ version }. Found: ${ found }`
      )
    }

    url = asset.url
    headers = { accept: 'application/octet-stream' }
  }

  return {
    url,
    binPath,
    headers
  };
}

async function run() {
    const token = core.getInput('token');
    let auth = !token ? undefined : `token ${token}`;

	const version = core.getInput('paws-version');
	const download = await getDownloadUrl(version, token);
    
    console.log(`Downloading: ${ download.url }`);
    const pathToTarball = await tc.downloadTool(download.url, undefined, auth, download.headers);

	const extract = download.url.endsWith('.zip') ? tc.extractZip : tc.extractTar;
	const pathToCLI = await extract(pathToTarball);
	
    const pathToBin = path.join(pathToCLI, download.binPath)
    console.log(`Registering path: ${ pathToBin }`);
	core.addPath(pathToBin);
}

module.exports = run;