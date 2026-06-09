class StationGroup:
    def __init__(self, groupId, name):
        self.groupId = groupId
        self.name = name


class Company:
    def __init__(self, companyId, name, groups):
        self.companyId = companyId
        self.name = name
        self.groups = groups


class User:
    def __init__(
        self,
        userId,
        username,
        firstName,
        lastName,
        email,
        password,
        role,
        companyId=None,
        vehicles=None,
        favorites=None,
    ):
        self.userId = userId
        self.username = username
        self.firstName = firstName
        self.lastName = lastName
        self.email = email
        self.password = password
        self.role = role
        self.companyId = companyId
        self.vehicles = vehicles or []
        self.favorites = favorites or []


class Station:
    def __init__(
        self,
        stationId,
        title,
        groupId,
        location,
        connector,
        telemetry,
        state="available",
        alive=True,
    ):
        self.stationId = stationId
        self.title = title
        self.groupId = groupId
        self.location = location
        self.connector = connector
        self.telemetry = telemetry
        self.state = state
        self.alive = alive


class Ticket:
    def __init__(
        self,
        ticketId,
        stationId,
        createdBy,
        title,
        description,
        status="open",
        remarks=None,
        closedAt=None,
        companyId=None,
    ):
        self.ticketId = ticketId
        self.stationId = stationId
        self.createdBy = createdBy
        self.title = title
        self.description = description
        self.status = status
        self.remarks = remarks
        self.closedAt = closedAt
        self.companyId = companyId


class StationUsage:
    def __init__(self, usageId, userId, stationId, plate, endTime=None, state="active", createdAt=None):
        self.usageId = usageId
        self.userId = userId
        self.stationId = stationId
        self.plate = plate
        self.endTime = endTime
        self.state = state
        self.createdAt = createdAt
