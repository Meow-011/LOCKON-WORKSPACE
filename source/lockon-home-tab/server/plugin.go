package main

import (
	"sync"

	"github.com/mattermost/mattermost/server/public/plugin"
)

// Plugin implements the Mattermost Plugin interface.
// Home Tab is primarily a frontend plugin — the backend is minimal.
type Plugin struct {
	plugin.MattermostPlugin
	configurationLock sync.RWMutex
}

func (p *Plugin) OnActivate() error {
	return nil
}
