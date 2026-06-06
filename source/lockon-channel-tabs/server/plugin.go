package main

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/gorilla/mux"
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
)

// Plugin implements the Mattermost Plugin interface.
type Plugin struct {
	plugin.MattermostPlugin
	configurationLock sync.RWMutex
	configuration     *configuration
	router            *mux.Router
}

// Tab represents a single tab in a channel.
type Tab struct {
	ID        string `json:"id"`
	ChannelID string `json:"channel_id"`
	Type      string `json:"type"`  // "pins", "files", "links", "notes"
	Title     string `json:"title"`
	Position  int    `json:"position"`
	Data      string `json:"data"` // JSON payload (e.g. URL for links, content for notes)
	CreatedBy string `json:"created_by"`
	CreatedAt int64  `json:"created_at"`
}

// LinkItem represents a saved link within a Links tab.
type LinkItem struct {
	ID    string `json:"id"`
	URL   string `json:"url"`
	Title string `json:"title"`
	AddedBy string `json:"added_by"`
}

// NoteItem represents a note within a Notes tab.
type NoteItem struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Content   string `json:"content"`
	UpdatedBy string `json:"updated_by"`
	UpdatedAt int64  `json:"updated_at"`
}

func (p *Plugin) OnActivate() error {
	p.router = p.initAPI()
	return nil
}

func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	p.router.ServeHTTP(w, r)
}

func (p *Plugin) initAPI() *mux.Router {
	r := mux.NewRouter()
	apiRouter := r.PathPrefix("/api/v1").Subrouter()

	// Tabs CRUD
	apiRouter.HandleFunc("/channels/{channelId}/tabs", p.handleGetTabs).Methods("GET")
	apiRouter.HandleFunc("/channels/{channelId}/tabs", p.handleCreateTab).Methods("POST")
	apiRouter.HandleFunc("/channels/{channelId}/tabs/{tabId}", p.handleDeleteTab).Methods("DELETE")

	// Links within a channel
	apiRouter.HandleFunc("/channels/{channelId}/links", p.handleGetLinks).Methods("GET")
	apiRouter.HandleFunc("/channels/{channelId}/links", p.handleAddLink).Methods("POST")
	apiRouter.HandleFunc("/channels/{channelId}/links/{linkId}", p.handleDeleteLink).Methods("DELETE")

	// Notes within a channel
	apiRouter.HandleFunc("/channels/{channelId}/notes", p.handleGetNotes).Methods("GET")
	apiRouter.HandleFunc("/channels/{channelId}/notes", p.handleSaveNote).Methods("POST")

	return r
}

// --- Helper: auth check ---
func (p *Plugin) getUserID(r *http.Request) string {
	return r.Header.Get("Mattermost-User-Id")
}

func (p *Plugin) respondJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func (p *Plugin) respondError(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

// --- KV Store keys ---
func tabsKey(channelID string) string {
	return "tabs_" + channelID
}

func linksKey(channelID string) string {
	return "links_" + channelID
}

func notesKey(channelID string) string {
	return "notes_" + channelID
}

// --- Tabs Handlers ---

func (p *Plugin) handleGetTabs(w http.ResponseWriter, r *http.Request) {
	userID := p.getUserID(r)
	if userID == "" {
		p.respondError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	channelID := mux.Vars(r)["channelId"]
	tabs, err := p.getTabs(channelID)
	if err != nil {
		p.respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// If no tabs exist yet, return default tabs
	if len(tabs) == 0 {
		tabs = p.getDefaultTabs(channelID)
	}

	p.respondJSON(w, tabs)
}

func (p *Plugin) handleCreateTab(w http.ResponseWriter, r *http.Request) {
	userID := p.getUserID(r)
	if userID == "" {
		p.respondError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	channelID := mux.Vars(r)["channelId"]

	var tab Tab
	if err := json.NewDecoder(r.Body).Decode(&tab); err != nil {
		p.respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	tab.ID = model.NewId()
	tab.ChannelID = channelID
	tab.CreatedBy = userID
	tab.CreatedAt = model.GetMillis()

	tabs, _ := p.getTabs(channelID)
	if len(tabs) == 0 {
		tabs = p.getDefaultTabs(channelID)
	}
	tab.Position = len(tabs)
	tabs = append(tabs, tab)

	if err := p.saveTabs(channelID, tabs); err != nil {
		p.respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	p.respondJSON(w, tab)
}

func (p *Plugin) handleDeleteTab(w http.ResponseWriter, r *http.Request) {
	userID := p.getUserID(r)
	if userID == "" {
		p.respondError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	vars := mux.Vars(r)
	channelID := vars["channelId"]
	tabID := vars["tabId"]

	tabs, _ := p.getTabs(channelID)
	newTabs := []Tab{}
	for _, t := range tabs {
		if t.ID != tabID {
			newTabs = append(newTabs, t)
		}
	}

	if err := p.saveTabs(channelID, newTabs); err != nil {
		p.respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	p.respondJSON(w, map[string]string{"status": "ok"})
}

// --- Links Handlers ---

func (p *Plugin) handleGetLinks(w http.ResponseWriter, r *http.Request) {
	userID := p.getUserID(r)
	if userID == "" {
		p.respondError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	channelID := mux.Vars(r)["channelId"]
	links, _ := p.getLinks(channelID)
	p.respondJSON(w, links)
}

func (p *Plugin) handleAddLink(w http.ResponseWriter, r *http.Request) {
	userID := p.getUserID(r)
	if userID == "" {
		p.respondError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	channelID := mux.Vars(r)["channelId"]

	var link LinkItem
	if err := json.NewDecoder(r.Body).Decode(&link); err != nil {
		p.respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	link.ID = model.NewId()
	link.AddedBy = userID

	links, _ := p.getLinks(channelID)
	links = append(links, link)

	if err := p.saveLinks(channelID, links); err != nil {
		p.respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	p.respondJSON(w, link)
}

func (p *Plugin) handleDeleteLink(w http.ResponseWriter, r *http.Request) {
	userID := p.getUserID(r)
	if userID == "" {
		p.respondError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	vars := mux.Vars(r)
	channelID := vars["channelId"]
	linkID := vars["linkId"]

	links, _ := p.getLinks(channelID)
	newLinks := []LinkItem{}
	for _, l := range links {
		if l.ID != linkID {
			newLinks = append(newLinks, l)
		}
	}

	if err := p.saveLinks(channelID, newLinks); err != nil {
		p.respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	p.respondJSON(w, map[string]string{"status": "ok"})
}

// --- Notes Handlers ---

func (p *Plugin) handleGetNotes(w http.ResponseWriter, r *http.Request) {
	userID := p.getUserID(r)
	if userID == "" {
		p.respondError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	channelID := mux.Vars(r)["channelId"]
	note, _ := p.getNote(channelID)
	p.respondJSON(w, note)
}

func (p *Plugin) handleSaveNote(w http.ResponseWriter, r *http.Request) {
	userID := p.getUserID(r)
	if userID == "" {
		p.respondError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	channelID := mux.Vars(r)["channelId"]

	var note NoteItem
	if err := json.NewDecoder(r.Body).Decode(&note); err != nil {
		p.respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	note.UpdatedBy = userID
	note.UpdatedAt = model.GetMillis()
	if note.ID == "" {
		note.ID = model.NewId()
	}

	if err := p.saveNote(channelID, note); err != nil {
		p.respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	p.respondJSON(w, note)
}

// --- KV Store Operations ---

func (p *Plugin) getTabs(channelID string) ([]Tab, error) {
	data, appErr := p.API.KVGet(tabsKey(channelID))
	if appErr != nil {
		return nil, appErr
	}
	if data == nil {
		return []Tab{}, nil
	}
	var tabs []Tab
	if err := json.Unmarshal(data, &tabs); err != nil {
		return nil, err
	}
	return tabs, nil
}

func (p *Plugin) saveTabs(channelID string, tabs []Tab) error {
	data, err := json.Marshal(tabs)
	if err != nil {
		return err
	}
	appErr := p.API.KVSet(tabsKey(channelID), data)
	if appErr != nil {
		return appErr
	}
	return nil
}

func (p *Plugin) getLinks(channelID string) ([]LinkItem, error) {
	data, appErr := p.API.KVGet(linksKey(channelID))
	if appErr != nil {
		return nil, appErr
	}
	if data == nil {
		return []LinkItem{}, nil
	}
	var links []LinkItem
	if err := json.Unmarshal(data, &links); err != nil {
		return nil, err
	}
	return links, nil
}

func (p *Plugin) saveLinks(channelID string, links []LinkItem) error {
	data, err := json.Marshal(links)
	if err != nil {
		return err
	}
	appErr := p.API.KVSet(linksKey(channelID), data)
	if appErr != nil {
		return appErr
	}
	return nil
}

func (p *Plugin) getNote(channelID string) (NoteItem, error) {
	data, appErr := p.API.KVGet(notesKey(channelID))
	if appErr != nil {
		return NoteItem{}, appErr
	}
	if data == nil {
		return NoteItem{ID: model.NewId(), Title: "Channel Notes", Content: ""}, nil
	}
	var note NoteItem
	if err := json.Unmarshal(data, &note); err != nil {
		return NoteItem{}, err
	}
	return note, nil
}

func (p *Plugin) saveNote(channelID string, note NoteItem) error {
	data, err := json.Marshal(note)
	if err != nil {
		return err
	}
	appErr := p.API.KVSet(notesKey(channelID), data)
	if appErr != nil {
		return appErr
	}
	return nil
}

func (p *Plugin) getDefaultTabs(channelID string) []Tab {
	return []Tab{
		{ID: "pins", ChannelID: channelID, Type: "pins", Title: "📌 Pins", Position: 0},
		{ID: "files", ChannelID: channelID, Type: "files", Title: "📁 Files", Position: 1},
		{ID: "links", ChannelID: channelID, Type: "links", Title: "🔗 Links", Position: 2},
		{ID: "notes", ChannelID: channelID, Type: "notes", Title: "📝 Notes", Position: 3},
	}
}
