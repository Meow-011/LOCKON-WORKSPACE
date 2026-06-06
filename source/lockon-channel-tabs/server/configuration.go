package main

// configuration captures the plugin's external configuration.
type configuration struct {
	EnablePinsTab  bool `json:"EnablePinsTab"`
	EnableFilesTab bool `json:"EnableFilesTab"`
	EnableLinksTab bool `json:"EnableLinksTab"`
	EnableNotesTab bool `json:"EnableNotesTab"`
}

func (p *Plugin) getConfiguration() *configuration {
	p.configurationLock.RLock()
	defer p.configurationLock.RUnlock()

	if p.configuration == nil {
		return &configuration{
			EnablePinsTab:  true,
			EnableFilesTab: true,
			EnableLinksTab: true,
			EnableNotesTab: true,
		}
	}
	return p.configuration
}

func (p *Plugin) OnConfigurationChange() error {
	var cfg configuration
	if err := p.API.LoadPluginConfiguration(&cfg); err != nil {
		return err
	}

	p.configurationLock.Lock()
	p.configuration = &cfg
	p.configurationLock.Unlock()

	return nil
}
