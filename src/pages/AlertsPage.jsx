import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  Link2,
  Plus,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { Input } from "../components/ui/Input.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { useToast } from "../components/ui/useToast.js";
import { formatDateTime } from "../lib/format.js";
import {
  createAlertChannel,
  deleteAlertChannel,
  listAlertChannels,
  listAlertEvents,
  updateAlertChannel,
} from "../services/alert-api.js";

const defaultFormData = {
  name: "",
  url: "",
  isActive: true,
};

const eventTypeFilters = [
  { label: "All events", value: "ALL" },
  { label: "Opened", value: "INCIDENT_OPENED" },
  { label: "Resolved", value: "INCIDENT_RESOLVED" },
];

const deliveryFilters = [
  { label: "All deliveries", value: "ALL" },
  { label: "Sent", value: "SENT" },
  { label: "Failed", value: "FAILED" },
];

function formatEventType(eventType) {
  if (eventType === "INCIDENT_OPENED") {
    return "Incident opened";
  }

  if (eventType === "INCIDENT_RESOLVED") {
    return "Incident resolved";
  }

  return eventType;
}

export function AlertsPage() {
  const { showToast } = useToast();
  const { activeWorkspace, activeWorkspaceId, isLoadingShell } =
    useOutletContext();
  const [channels, setChannels] = useState([]);
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState(defaultFormData);
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [deliveryFilter, setDeliveryFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [eventError, setEventError] = useState("");
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [channelPendingDelete, setChannelPendingDelete] = useState(null);
  const [updatingChannelId, setUpdatingChannelId] = useState("");

  const eventCounts = useMemo(
    () =>
      events.reduce(
        (summary, event) => ({
          ...summary,
          [event.deliveryStatus]: (summary[event.deliveryStatus] || 0) + 1,
        }),
        {}
      ),
    [events]
  );

  async function loadChannels() {
    if (!activeWorkspaceId) {
      return;
    }

    setError("");
    setIsLoadingChannels(true);

    try {
      const result = await listAlertChannels(activeWorkspaceId);
      setChannels(result.data.alertChannels);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoadingChannels(false);
    }
  }

  async function loadEvents() {
    if (!activeWorkspaceId) {
      return;
    }

    setEventError("");
    setIsLoadingEvents(true);

    try {
      const result = await listAlertEvents(activeWorkspaceId, {
        eventType: eventTypeFilter,
        deliveryStatus: deliveryFilter,
      });
      setEvents(result.data.alertEvents);
    } catch (requestError) {
      setEventError(requestError.message);
    } finally {
      setIsLoadingEvents(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialChannels() {
      if (!activeWorkspaceId) {
        return;
      }

      setError("");
      setIsLoadingChannels(true);

      try {
        const result = await listAlertChannels(activeWorkspaceId);

        if (isMounted) {
          setChannels(result.data.alertChannels);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingChannels(false);
        }
      }
    }

    loadInitialChannels();

    return () => {
      isMounted = false;
    };
  }, [activeWorkspaceId]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialEvents() {
      if (!activeWorkspaceId) {
        return;
      }

      setEventError("");
      setIsLoadingEvents(true);

      try {
        const result = await listAlertEvents(activeWorkspaceId, {
          eventType: eventTypeFilter,
          deliveryStatus: deliveryFilter,
        });

        if (isMounted) {
          setEvents(result.data.alertEvents);
        }
      } catch (requestError) {
        if (isMounted) {
          setEventError(requestError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingEvents(false);
        }
      }
    }

    loadInitialEvents();

    return () => {
      isMounted = false;
    };
  }, [activeWorkspaceId, eventTypeFilter, deliveryFilter]);

  const updateField = (event) => {
    const { checked, name, type, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateChannel = async (event) => {
    event.preventDefault();

    if (!activeWorkspaceId) {
      return;
    }

    setFormError("");
    setIsCreating(true);

    try {
      const result = await createAlertChannel(activeWorkspaceId, {
        name: formData.name.trim(),
        url: formData.url.trim(),
        isActive: formData.isActive,
      });

      setChannels((current) => [result.data.alertChannel, ...current]);
      setFormData(defaultFormData);
      setIsFormOpen(false);
      showToast({
        title: "Webhook created",
        message: `${result.data.alertChannel.name} is ready for alerts.`,
        type: "success",
      });
    } catch (requestError) {
      setFormError(requestError.message);
      showToast({
        title: "Could not create webhook",
        message: requestError.message,
        type: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleChannel = async (channel) => {
    if (!activeWorkspaceId) {
      return;
    }

    setUpdatingChannelId(channel.id);
    setError("");

    try {
      const result = await updateAlertChannel(activeWorkspaceId, channel.id, {
        isActive: !channel.isActive,
      });

      setChannels((current) =>
        current.map((item) =>
          item.id === channel.id ? result.data.alertChannel : item
        )
      );
      showToast({
        title: result.data.alertChannel.isActive
          ? "Webhook enabled"
          : "Webhook disabled",
        message: result.data.alertChannel.name,
        type: "success",
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Could not update webhook",
        message: requestError.message,
        type: "error",
      });
    } finally {
      setUpdatingChannelId("");
    }
  };

  const handleDeleteChannel = async () => {
    if (!activeWorkspaceId) {
      return;
    }

    if (!channelPendingDelete) {
      return;
    }

    setUpdatingChannelId(channelPendingDelete.id);
    setError("");

    try {
      await deleteAlertChannel(activeWorkspaceId, channelPendingDelete.id);
      setChannels((current) =>
        current.filter((channel) => channel.id !== channelPendingDelete.id)
      );
      showToast({
        title: "Webhook deleted",
        message: `${channelPendingDelete.name} was removed.`,
        type: "success",
      });
      setChannelPendingDelete(null);
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Could not delete webhook",
        message: requestError.message,
        type: "error",
      });
    } finally {
      setUpdatingChannelId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="mt-1 text-sm text-slate-600">
            {activeWorkspace
              ? `Webhook notifications for ${activeWorkspace.name}.`
              : "Loading workspace alerts."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={isLoadingChannels || isLoadingEvents || isLoadingShell}
            onClick={() => {
              loadChannels();
              loadEvents();
            }}
            variant="secondary"
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button
            disabled={!activeWorkspaceId}
            onClick={() => setIsFormOpen((current) => !current)}
          >
            <Plus size={16} />
            New webhook
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Channels", channels.length, Bell],
          [
            "Active",
            channels.filter((channel) => channel.isActive).length,
            CheckCircle2,
          ],
          ["Sent", eventCounts.SENT || 0, Send],
          ["Failed", eventCounts.FAILED || 0, Link2],
        ].map(([label, value, Icon]) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={label}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <Icon size={18} className="text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-bold">
              {isLoadingChannels || isLoadingEvents ? "--" : value}
            </p>
          </div>
        ))}
      </div>

      {isFormOpen ? (
        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleCreateChannel}
        >
          <div>
            <h2 className="text-lg font-bold">Create webhook channel</h2>
            <p className="mt-1 text-sm text-slate-600">
              Pingbase sends incident opened and resolved events to this URL.
            </p>
          </div>

          {formError ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {formError}
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Name</span>
              <Input
                name="name"
                onChange={updateField}
                placeholder="Pipedream Webhook"
                required
                value={formData.name}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Webhook URL
              </span>
              <Input
                name="url"
                onChange={updateField}
                placeholder="https://..."
                required
                type="url"
                value={formData.url}
              />
            </label>
          </div>

          <label className="mt-4 flex w-fit items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              checked={formData.isActive}
              className="h-4 w-4 rounded border-slate-300"
              name="isActive"
              onChange={updateField}
              type="checkbox"
            />
            Active immediately
          </label>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button
              onClick={() => setIsFormOpen(false)}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button disabled={isCreating} type="submit">
              {isCreating ? "Creating..." : "Create webhook"}
            </Button>
          </div>
        </form>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold">Webhook channels</h2>
          <span className="text-sm font-medium text-slate-500">
            {isLoadingChannels ? "Loading..." : `${channels.length} total`}
          </span>
        </div>

        {channels.length === 0 && !isLoadingChannels ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-500">
              <Bell size={20} />
            </div>
            <h3 className="mt-4 text-lg font-bold">No webhooks yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Add a webhook URL from Pipedream, Slack workflows, Discord,
              Zapier, Make, or any system that accepts JSON POST requests.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {channels.map((channel) => (
              <article
                className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto]"
                key={channel.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-bold">
                      {channel.name}
                    </h3>
                    <StatusBadge status={channel.isActive ? "SENT" : "PAUSED"} />
                  </div>
                  <p className="mt-2 break-all text-sm text-slate-600">
                    {channel.url}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase text-slate-400">
                    {channel.type}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <Button
                    disabled={updatingChannelId === channel.id}
                    onClick={() => handleToggleChannel(channel)}
                    variant="secondary"
                  >
                    {channel.isActive ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    disabled={updatingChannelId === channel.id}
                    onClick={() => setChannelPendingDelete(channel)}
                    variant="ghost"
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        confirmLabel="Delete webhook"
        description={
          channelPendingDelete
            ? `${channelPendingDelete.name} will stop receiving incident alerts. Existing delivery history will remain visible.`
            : ""
        }
        isLoading={Boolean(updatingChannelId)}
        isOpen={Boolean(channelPendingDelete)}
        onClose={() => {
          if (!updatingChannelId) {
            setChannelPendingDelete(null);
          }
        }}
        onConfirm={handleDeleteChannel}
        title="Delete webhook?"
      />

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold">Delivery events</h2>
            <p className="mt-1 text-sm text-slate-600">
              Recent webhook attempts created by incident changes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              onChange={(event) => setEventTypeFilter(event.target.value)}
              value={eventTypeFilter}
            >
              {eventTypeFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              onChange={(event) => setDeliveryFilter(event.target.value)}
              value={deliveryFilter}
            >
              {deliveryFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {eventError ? (
          <p className="m-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {eventError}
          </p>
        ) : null}

        {events.length === 0 && !isLoadingEvents ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-500">
              <Send size={20} />
            </div>
            <h3 className="mt-4 text-lg font-bold">No delivery events yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Events appear after an incident opens or resolves and Pingbase
              attempts to notify your active webhook channels.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {events.map((event) => (
              <article
                className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto]"
                key={event.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold">
                      {formatEventType(event.eventType)}
                    </h3>
                    <StatusBadge status={event.deliveryStatus} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {event.alertChannel?.name || "Deleted channel"}
                  </p>
                  {event.errorMessage ? (
                    <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                      {event.errorMessage}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[420px]">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      HTTP
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {event.responseStatusCode || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Sent
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {formatDateTime(event.sentAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Created
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {formatDateTime(event.createdAt)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
