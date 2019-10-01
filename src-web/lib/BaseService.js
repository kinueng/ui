export const fetchNamespaces = () => {
  return fetch('/kappnav/namespaces')
    .then(res => res.json())
    .then(result => {
      var namespacesArray = []
      result.namespaces.forEach((ns) => {
        var itemObj = {}
        itemObj.Name = ns.metadata.name
        namespacesArray.push(itemObj)
      })
      return namespacesArray
    })
}


export const fetchExistingSecrets = () => {
  return fetch('/kappnav/secrets/credential-type/app-navigator')
    .then(res => res.json())
    .then(result => {
      var existingSecretsArray = []
      result.secrets.forEach((ns) => {
        var itemObj = {}
        itemObj.Name = ns.metadata.name
        existingSecretsArray.push(itemObj)
      })
      return existingSecretsArray
    })
}

export const fetchAppNavConfigMap = () => {
  return fetch('/kappnav/configmap/kappnav-config?namespace=' + document.documentElement.getAttribute('appnavConfigmapNamespace'))
    .then(res => res.json())
    .then(result => {
      var data = result.data
      var appNavConfigData = {}
      appNavConfigData.statuColorMapping = JSON.parse(data['status-color-mapping'])
      appNavConfigData.statusPrecedence = JSON.parse(data['app-status-precedence'])
      appNavConfigData.statusUnknown = data['status-unknown']
      return appNavConfigData
    })
}
